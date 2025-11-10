 'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import useProducts from '@/app/hooks/useProducts.jsx';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';

export default function ProductsTable({ searchQuery, category, stock, pageSize = 10 }) {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);

  const { products, loading, page, loadNextPage, loadPrevPage } = useProducts({
    pageSize,
    search: searchQuery, // <-- already debounced by parent
    category, // "all" | "power-tools" | ...
    stock, // "all" | "in-stock" | "low-stock" | "out-of-stock"
    reloadKey,
  });

  const threadTable = ['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-orange-100">
            {threadTable.map((th) => (
              <th
                key={th}
                className={`py-4 px-4 text-sm font-semibold text-gray-700 ${
                  th === 'Actions' ? 'text-right' : 'text-left'
                }`}
              >
                {th}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-500">
                Loading products…
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const status =
                product.stock > 10
                  ? 'in-stock'
                  : product.stock > 0 && product.stock <= 10
                  ? 'low-stock'
                  : 'out-of-stock';

              return (
                <tr
                  key={product.id}
                  className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-orange-100"
                      />
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-600 font-mono text-sm">{product.sku}</td>
                  <td className="py-4 px-4 text-gray-600">{product.category}</td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    ${Number(product.price ?? 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{product.stock}</td>

                  <td className="py-4 px-4">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                        status === 'in-stock' && 'bg-green-100 text-green-700',
                        status === 'low-stock' && 'bg-amber-100 text-amber-700',
                        status === 'out-of-stock' && 'bg-red-100 text-red-700',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {status === 'in-stock' ? 'In Stock' : status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          const ok = window.confirm(`Delete product "${product.name}"? This cannot be undone.`);
                          if (!ok) return;
                          try {
                            await deleteDoc(doc(db, 'products', product.id));
                            // trigger a reload of products
                            setReloadKey((k) => k + 1);
                            // small UX feedback
                            window.alert('Product deleted');
                          } catch (err) {
                            console.error('Failed to delete product', err);
                            window.alert('Failed to delete product. Check console for details.');
                          }
                        }}
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>

                      <details className="relative">
                        <summary className="list-none cursor-pointer inline-flex items-center rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-orange-50">
                          <MoreHorizontal className="w-4 h-4" />
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-orange-100 bg-white p-1 shadow-lg">
                          <button className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-orange-50">
                            View Details
                          </button>
                          <button className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-orange-50">
                            Duplicate
                          </button>
                          <button className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-orange-100">
        <p className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={loadPrevPage}
            disabled={page === 1 || loading}
            className="border border-orange-200 rounded-xl px-3 py-1.5 text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={loadNextPage}
            disabled={loading}
            className="border border-orange-200 rounded-xl px-3 py-1.5 text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
