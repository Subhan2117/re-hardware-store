'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/api/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // ensure it's a string

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) Fetch the category by ID
        const catRef = doc(db, 'categories', id);
        const catSnap = await getDoc(catRef);

        if (!catSnap.exists()) {
          setCategory(null);
          setProducts([]);
          setLoading(false);
          return;
        }

        const catData = { id: catSnap.id, ...catSnap.data() };
        setCategory(catData);

        // 2) Fetch products that belong to this category
        //    assuming product.category === category.name
        const prodRef = collection(db, 'products');
        const q = query(prodRef, where('category', '==', catData.name));
        const prodSnap = await getDocs(q);

        const prodData = prodSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setProducts(prodData);
      } catch (err) {
        console.error('Error loading category detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading category...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Link>

          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-red-700">
            Category not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/categories"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Link>

            <h1 className="text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Showing all products in this category
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Products in this category
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {products.length}
            </div>
          </div>
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              No products in this category yet
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Add products from the products admin page and assign them to{' '}
              <span className="font-medium">{category.name}</span>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-gray-200 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    {typeof product.stock !== 'undefined' && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>

                  {product.sku && (
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      {typeof product.price === 'number'
                        ? `$${product.price.toFixed(2)}`
                        : product.price || '—'}
                    </span>
                    {product.rating && (
                      <span className="text-xs text-amber-600">
                        ★ {Number(product.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
