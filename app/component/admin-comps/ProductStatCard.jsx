'use client';

import { db } from '@/app/api/firebase/firebase';
import {
  collection,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductStatCard() {
  const [counts, setCounts] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outStock: 0,
    loading: true,
  });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const col = collection(db, 'products');

        // ✅ use getCountFromServer instead of collection()
        const totalSnap = await getCountFromServer(query(col));
        const inSnap = await getCountFromServer(
          query(col, where('stock', '>', 10))
        );
        const lowSnap = await getCountFromServer(
          query(col, where('stock', '>', 0), where('stock', '<=', 10))
        );
        const outSnap = await getCountFromServer(
          query(col, where('stock', '==', 0))
        );

        if (!alive) return;
        setCounts({
          total: totalSnap.data().count,
          inStock: inSnap.data().count,
          lowStock: lowSnap.data().count,
          outStock: outSnap.data().count,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching product counts:', err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {/* --- Total Products --- */}

      <div className="bg-white rounded-2xl border border-orange-100 shadow-md hover:shadow-lg transition-all duration-300 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">
              {counts.total}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-300 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">In Stock</p>
            <p className="text-3xl font-semibold text-green-600 mt-1">
              {counts.inStock}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-md hover:shadow-lg transition-all duration-300 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Low Stock</p>
            <p className="text-3xl font-semibold text-amber-600 mt-1">
              {counts.lowStock}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Out of Stock */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-md hover:shadow-lg transition-all duration-300 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="text-3xl font-semibold text-red-600 mt-1">
              {counts.outStock}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
