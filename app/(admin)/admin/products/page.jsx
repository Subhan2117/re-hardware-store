'use client';
import { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import ProductsTable from '@/app/component/admin-comps/ProductsTable';
import ProductStatCard from '@/app/component/admin-comps/ProductStatCard';
import { db } from '@/api/firebase/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import Link from 'next/link';

// tiny debounce hook (200ms by default)
function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showNewProduct, setShowNewProduct] = useState(false);

  // use the debounced value for any filtering/fetch
  const debouncedQuery = useDebounce(searchQuery, 200);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // If your docs have a 'name' field, we can sort by it. If not, remove orderBy.
        const q = fsQuery(collection(db, 'categories'), orderBy('name'));
        const snap = await getDocs(q);

        // Normalize to {label, value}. Make sure 'value' matches product.category.
        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          const label = data.name ?? d.id; // shown in dropdown
          const value = (data.name ?? d.id).trim(); // <-- this matches product.category ("power-tools")
          return { label, value };
        });

        if (alive) setCategories(rows);
      } catch (e) {
        console.error('Load categories failed:', e);
        if (alive) setCategories([]);
      } finally {
        if (alive) setCatLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  async function handleCreateProduct(payload) {
    // sanitize/coerce
    const docData = {
      name: payload.name.trim(),
      price: Number(payload.price),
      stock: Number(payload.stock),
      category: payload.category, // matches dropdown value
      image: payload.image || '',
      description: payload.description || '',
      createdAt: serverTimestamp?.() ?? new Date(),
    };
    await addDoc(collection(db, 'products'), docData);
    setShowNewProduct(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="pt-5 p-2">
        {/* Title */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory
              </p>
            </div>
            <Link
            href={'/admin/products/new'}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg flex items-center px-2 py-1 rounded-xl"
              onClick={() => setShowNewProduct(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="">
            {/* Total Products */}
            <ProductStatCard />
          </div>

          {/* Main layout for the Products */}
          <div className="max-w-7xl mx-auto space-y-6">
            {/* SEARCH AND FILTERS */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-md p-5">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search */}
                <div className="flex-1 w-full md:max-w-md">
                  {/* Make label visible (remove sr-only) */}
                  <label
                    htmlFor="product-search"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search products
                  </label>

                  <div className="relative">
                    {/* Icon */}
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
                      aria-hidden="true"
                    />
                    <input
                      id="product-search"
                      type="text"
                      placeholder="Search products by name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 w-full md:w-auto">
                  {/* Category */}
                  <div className="w-full md:w-[180px]">
                    <label
                      htmlFor="category-filter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900
             focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                    >
                      <option value="all">All Categories</option>

                      {catLoading ? (
                        <option disabled>Loading…</option>
                      ) : categories.length === 0 ? (
                        <option disabled>No categories</option>
                      ) : (
                        categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="w-full md:w-[180px]">
                    <label
                      htmlFor="stock-filter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stock Status
                    </label>
                    <select
                      id="stock-filter"
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900
                                 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                    >
                      <option value="all">All Status</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Example note: use debouncedQuery for results */}
              {/* <ProductsTable query={debouncedQuery} category={categoryFilter} stock={stockFilter} /> */}
              {/* wherever you render the table */}
              <ProductsTable
                searchQuery={debouncedQuery} // from your header
                category={categoryFilter}
                stock={stockFilter}
                pageSize={10}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
