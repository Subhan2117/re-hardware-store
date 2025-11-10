// app/catalog/CatalogClient.jsx
'use client';

import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useCatalogFilters from '@/app/hooks/useCatalogFilters';
import ProductCard from '@/app/component/ProductCard';
import { useCart } from '@/app/context/CartContext';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function StoreClient({
  categoryOptions,
  priceOptions,
  stockOptions,
  initialSearch = '',
}) {
  const [products, setProducts] = useState([]);

  // We will ONLY use dbCategories (from Firestore)
  const [dbCategories, setDbCategories] = useState([
    { value: 'all', label: 'All categories' },
  ]);

  // Helper to mirror the slug logic from useCatalogFilters
  const slug = (s) => s?.toString().toLowerCase().replace(/\s+/g, '-');

  // Fetch products + reviews from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Get products
        const productsSnap = await getDocs(collection(db, 'products'));
        const rawProducts = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2) Get *all* reviews
        const reviewsSnap = await getDocs(collection(db, 'reviews'));

        // 3) Build a map: productId -> { total, count }
        const stats = {};
        reviewsSnap.forEach((doc) => {
          const data = doc.data();
          const productId = data.productId;
          const rating = Number(data.rating);

          if (!productId || Number.isNaN(rating)) return;

          if (!stats[productId]) {
            stats[productId] = { total: 0, count: 0 };
          }
          stats[productId].total += rating;
          stats[productId].count += 1;
        });

        // 4) Attach avg rating + reviewCount to each product
        const merged = rawProducts.map((p) => {
          const s = stats[p.id];
          if (!s) {
            return { ...p, rating: null, reviewCount: 0 };
          }
          return {
            ...p,
            rating: s.total / s.count,
            reviewCount: s.count,
          };
        });

        setProducts(merged);
      } catch (error) {
        console.error('Error fetching products or reviews:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch categories from Firestore and build dropdown options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        if (snap.empty) {
          // If no categories collection, just leave "All categories"
          return;
        }

        const cats = snap.docs.map((doc) => doc.data());

        const normalized = cats.map((c) => {
          // Try to get a slug-like value from the doc
          const valueSlug =
            c.slug || c.value || slug(c.name || c.label || '');

          const labelText =
            c.name || c.label || c.slug || c.value || valueSlug;

          return {
            value: valueSlug, // this will be used in selectedCategory
            label: labelText, // what user sees in dropdown
          };
        });

        setDbCategories([
          { value: 'all', label: 'All categories' },
          ...normalized,
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const {
    searchQuery,
    selectedCategory,
    priceRange,
    stockFilter,
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    setStockFilter,
    filtered,
    clearFilters,
  } = useCatalogFilters(products);

  const { cart, addToCart } = useCart();
  const inputRef = useRef(null);

  // Apply query from ?search= if present
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      inputRef.current?.focus();
    }
  }, [initialSearch, setSearchQuery]);

  // For the "Active Filters" chip, show a nice label instead of the slug
  const selectedCategoryLabel =
    selectedCategory === 'all'
      ? null
      : dbCategories.find((c) => c.value === selectedCategory)?.label ||
        selectedCategory;

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 text-balance">
            Store Catalog
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Browse our complete selection of professional tools and hardware.
            Find exactly what you need for your next project.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12">
          {/* Filter Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <label htmlFor="search" className="sr-only">
                Search products
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="search"
                type="text"
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-4 backdrop-blur-xl border border-slate-200/30 
                 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-700 focus:outline-none
                 shadow-lg transition-all duration-300 ease-in-out rounded-2xl 
                 text-slate-800 placeholder:text-slate-400 bg-white/90"
              />
            </div>

            {/* Category */}
            <div className="backdrop-blur-xl border border-slate-200/30 shadow-lg rounded-2xl bg-white/90">
              <label htmlFor="category" className="sr-only">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 px-4 bg-transparent rounded-2xl text-slate-700 focus:outline-none"
              >
                {dbCategories.map((opt, idx) => (
                  <option key={`${opt.value}-${idx}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="backdrop-blur-xl border border-slate-200/30 shadow-lg rounded-2xl bg-white/90">
              <label htmlFor="price" className="sr-only">
                Price Range
              </label>
              <select
                id="price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-12 px-4 bg-transparent rounded-2xl text-slate-700 focus:outline-none"
              >
                {priceOptions.map((opt, idx) => (
                  <option key={`${opt.value}-${idx}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div className="backdrop-blur-xl border border-slate-200/30 shadow-lg rounded-2xl bg-white/90">
              <label htmlFor="stock" className="sr-only">
                Availability
              </label>
              <select
                id="stock"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full h-12 px-4 bg-transparent rounded-2xl text-slate-700 focus:outline-none"
              >
                {stockOptions.map((opt, idx) => (
                  <option key={`${opt.value}-${idx}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">
                Active Filters:
              </span>

              <div>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {selectedCategoryLabel}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-2 hover:text-amber-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {priceRange === 'under50'
                      ? 'Under $50'
                      : priceRange === '50to100'
                      ? '$50 - $100'
                      : 'Over $100'}
                    <button
                      onClick={() => setPriceRange('all')}
                      className="ml-2 hover:text-amber-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {stockFilter !== 'all' && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {stockFilter === 'instock' ? 'In Stock' : 'Out of Stock'}
                    <button
                      onClick={() => setStockFilter('all')}
                      className="ml-2 hover:text-amber-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
            {/* Clear Filters */}
            <div>
              <button
                type="button"
                onClick={clearFilters}
                className="self-start sm:self-auto text-sm bg-gradient-to-r text-white from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-3 py-1.5 rounded-2xl cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Results Count */}
          <div className="mb-6" aria-live="polite">
            <p className="text-slate-600">
              Showing{' '}
              <span className="font-bold text-slate-800">
                {filtered.length}
              </span>{' '}
              products
            </p>
          </div>

          <div
            className="
              grid gap-4 sm:gap-6
              [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]
              md:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]
              xl:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]
              auto-rows-fr
              items-stretch
            "
          >
            {filtered.map((p, idx) => (
              <div
                key={p.id ?? `product-${idx}`}
                className="relative h-full group"
              >
                <ProductCard
                  product={p}
                  onAddToCart={() => addToCart(p)}
                  cartQuantity={cart[p.id] || 0}
                  className="h-full"
                />
              </div>
            ))}

            {!filtered.length && (
              <div className="col-span-full text-center text-slate-500 py-12">
                No products match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
