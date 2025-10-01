// app/catalog/page.jsx
'use client';

import Navbar from '@/app/component/Navbar';
import { Search } from 'lucide-react';
import useCatalogFilters from '@/app/hooks/useCatalogFilters';
import {
  categoryOptions,
  priceOptions,
  stockOptions,
  mockProducts,
} from '@/app/mock-data/mockProducts.jsx';
import ProductCard from '@/app/component/ProductCard.jsx';
import { useRef, useState,useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || ''; // 👈 catch ?search=
  const inputRef = useRef(null);

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
  } = useCatalogFilters(mockProducts);
  const [cart, setCart] = useState({});
  const handleAddToCart = (productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

useEffect(() => {
  if (initialSearch) {
    setSearchQuery(initialSearch);
    // optional: auto-focus the input
    inputRef.current?.focus();
  }
}, [initialSearch, setSearchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden">
      <Navbar />

      {/* Main */}
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
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
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
                  {priceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
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
                  {stockOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            <div className="mt-4 flex items-center gap-2 flex-wrap justify-between">
              <div className="flex mr-1">
                <h1 className="font-semibold underline text-gray-700">
                  Active Filters:{' '}
                </h1>
                <div>
                  {selectedCategory !== 'all' && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-2 hover:text-amber-900"
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
                        className="ml-2 hover:text-amber-900"
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
                        className="ml-2 hover:text-amber-900"
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
                  className="text-sm bg-gradient-to-r text-white from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700  px-3 py-1.5 rounded-2xl"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          <div>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-600">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {filtered.length}
                </span>{' '}
                products
              </p>
            </div>
            {/* Results */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  cartQuantity={cart[p.id] || 0}
                />
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

      <section />
    </div>
  );
}
