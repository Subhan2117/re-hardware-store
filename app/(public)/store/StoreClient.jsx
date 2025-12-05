// app/catalog/CatalogClient.jsx
'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const [dbCategories, setDbCategories] = useState([
    { value: 'all', label: 'All categories' },
  ]);

  const slug = (s) => s?.toString().toLowerCase().replace(/\s+/g, '-');

  // small helper for Firestore timestamps / dates
  const toJsDate = (d) => {
    if (!d) return null;
    if (d.toDate) return d.toDate(); // Firestore Timestamp
    if (d instanceof Date) return d;
    return new Date(d);
  };

  const isDealActive = (deal, now) => {
    if (!deal) return false;

    // explicit off switch
    if (deal.active === false) return false;

    const start = toJsDate(deal.startAt);
    const end = toJsDate(deal.endAt);

    if (start && start > now) return false;
    if (end && end < now) return false;

    return true;
  };

  // Fetch products + reviews + deals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();

        // Products
        const productsSnap = await getDocs(collection(db, 'products'));
        const rawProducts = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Reviews
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
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

        // Deals
        const dealsSnap = await getDocs(collection(db, 'deals'));
        const dealsMap = {};
        dealsSnap.forEach((doc) => {
          const data = doc.data();
          if (!data.productId) return;
          dealsMap[data.productId] = { id: doc.id, ...data };
        });

        // Merge: rating + reviewCount + deal + finalPrice
        const merged = rawProducts.map((p) => {
          const s = stats[p.id];
          const rawDeal = dealsMap[p.id] || null;

          let rating = null;
          let reviewCount = 0;
          if (s) {
            rating = s.total / s.count;
            reviewCount = s.count;
          }

          // only keep deal if it's currently active
          const activeDeal = isDealActive(rawDeal, now) ? rawDeal : null;

          // base original price from product
          const productBasePrice =
            typeof p.price === 'number' ? p.price : Number(p.price ?? 0) || 0;

          // if deal doc also has its own originalPrice, prefer that for discount calc
          const dealOriginalPrice =
            typeof activeDeal?.originalPrice === 'number'
              ? activeDeal.originalPrice
              : productBasePrice;

          let finalPrice = productBasePrice;
          let discountPercent = null;

          if (activeDeal) {
            // ✅ 1) Use explicit dealPrice if present
            if (
              typeof activeDeal.dealPrice === 'number' &&
              !Number.isNaN(activeDeal.dealPrice)
            ) {
              finalPrice = Number(activeDeal.dealPrice.toFixed(2));

              if (dealOriginalPrice > 0 && finalPrice < dealOriginalPrice) {
                discountPercent = Math.round(
                  ((dealOriginalPrice - finalPrice) / dealOriginalPrice) * 100
                );
              }
            }

            // ✅ 2) Fallback: discountPercent / discountPercentage fields
            if (
              discountPercent == null &&
              typeof activeDeal.discountPercent === 'number'
            ) {
              discountPercent = activeDeal.discountPercent;
            } else if (
              discountPercent == null &&
              typeof activeDeal.discountPercentage === 'number'
            ) {
              discountPercent = activeDeal.discountPercentage;
            }

            // ✅ 3) Fallback: parse `savingsLabel` like "Save 25%"
            if (
              discountPercent == null &&
              typeof activeDeal.savingsLabel === 'string'
            ) {
              const match = activeDeal.savingsLabel.match(/(\d+(\.\d+)?)%/);
              if (match) {
                discountPercent = Number(match[1]);
              }
            }
          }

          // attach computed discountPercent back onto the deal object
          const dealForProduct = activeDeal
            ? { ...activeDeal, discountPercent }
            : null;

          return {
            ...p,
            rating,
            reviewCount,
            originalPrice: dealOriginalPrice,
            finalPrice,
            deal: dealForProduct,
          };
        });

        setProducts(merged);
      } catch (error) {
        console.error('Error fetching products, reviews, or deals:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        if (snap.empty) return;

        const cats = snap.docs.map((doc) => doc.data());

        const normalized = cats.map((c) => {
          const valueSlug = c.slug || c.value || slug(c.name || c.label || '');
          const labelText = c.name || c.label || c.slug || c.value || valueSlug;
          return {
            value: valueSlug,
            label: labelText,
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

  // Apply ?search= from URL
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      inputRef.current?.focus();
    }
  }, [initialSearch, setSearchQuery]);

  const selectedCategoryLabel =
    selectedCategory === 'all'
      ? null
      : dbCategories.find((c) => c.value === selectedCategory)?.label ||
        selectedCategory;

  // All CURRENT active deals from the product list
  const dealProducts = products.filter((p) => p.deal);

  const hasActiveDeal = (p) =>
    p.deal &&
    typeof p.finalPrice === 'number' &&
    !Number.isNaN(p.finalPrice) &&
    p.finalPrice < (p.originalPrice ?? p.price ?? Number.POSITIVE_INFINITY);

  const toCartItem = (p) => {
    const hasDeal = hasActiveDeal(p);

    const effectivePrice = hasDeal ? p.finalPrice : p.originalPrice ?? p.price;

    return {
      ...p,
      // what the cart should actually charge
      price: Number(effectivePrice.toFixed(2)),
      // keep the original so UI can show strikethrough if you want
      originalPrice: p.originalPrice ?? p.price,
    };
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-white to-amber-50/40">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2">
              Store Catalog
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Explore professional-grade tools, hardware, and supplies for every
              project — from quick fixes to full renovations.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs sm:text-sm text-amber-900 shadow-sm max-w-xs">
            <p className="font-semibold mb-1">Pro tip</p>
            <p>
              Try searching for a project, like{' '}
              <span className="font-semibold">“deck screws”</span> or{' '}
              <span className="font-semibold">“paint roller”</span>.
            </p>
          </div>
        </header>

        {/* Search & Filters */}
        <section className="mb-10">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-200/60 px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="w-full md:max-w-md relative">
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
                  placeholder="Search tools, hardware, or projects..."
                  className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500/60 transition-all"
                />
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {products.length}
                  </span>
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    Total products
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-semibold text-emerald-600">
                    {dealProducts.length}
                  </span>
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    Active deals
                  </span>
                </div>
              </div>
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex text-slate-500">
                  Category
                </span>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/70"
                >
                  {dbCategories.map((opt, idx) => (
                    <option key={`${opt.value}-${idx}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex text-slate-500">
                  Price
                </span>
                <select
                  id="price"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/70"
                >
                  {priceOptions.map((opt, idx) => (
                    <option key={`${opt.value}-${idx}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex text-slate-500">
                  Availability
                </span>
                <select
                  id="stock"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/70"
                >
                  {stockOptions.map((opt, idx) => (
                    <option key={`${opt.value}-${idx}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              <div className="flex items-center justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-2xl border border-amber-500/70 text-amber-700 px-3 py-1.5 text-xs sm:text-sm hover:bg-amber-50/80 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Clear filters
                </button>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="text-slate-500">Active:</span>
              {selectedCategory !== 'all' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                  {selectedCategoryLabel}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 hover:text-amber-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                  {priceRange === 'under50'
                    ? 'Under $50'
                    : priceRange === '50to100'
                    ? '$50 - $100'
                    : 'Over $100'}
                  <button
                    onClick={() => setPriceRange('all')}
                    className="ml-2 hover:text-amber-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {stockFilter !== 'all' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                  {stockFilter === 'instock' ? 'In Stock' : 'Out of Stock'}
                  <button
                    onClick={() => setStockFilter('all')}
                    className="ml-2 hover:text-amber-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory === 'all' &&
                priceRange === 'all' &&
                stockFilter === 'all' && (
                  <span className="text-slate-400">None</span>
                )}
            </div>
          </div>
        </section>

        {/* Deals Section */}
        {dealProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Deals & Specials
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                {dealProducts.length} item
                {dealProducts.length > 1 ? 's' : ''} on sale
              </span>
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
              {dealProducts.map((p, idx) => (
                <div
                  key={`deal-${p.id}-${idx}`}
                  className="relative h-full group"
                >
                  <ProductCard
                    product={p}
                    onAddToCart={() => addToCart(toCartItem(p))}
                    cartQuantity={cart[p.id] || 0}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing{' '}
              <span className="font-semibold text-slate-900">
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
                  onAddToCart={() => addToCart(toCartItem(p))}
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
        </section>
      </div>
    </div>
  );
}
