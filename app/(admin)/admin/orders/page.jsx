'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, PackageSearch, Truck, Clock } from 'lucide-react';

function statusBadgeClasses(status) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (s === 'in transit' || s === 'shipped')
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (s === 'processing')
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (s === 'cancelled' || s === 'canceled')
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  return 'bg-gray-50 text-gray-700 border border-gray-200';
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productSnapshot = await getDocs(collection(db, 'products'));
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price || 0,
        }));
        setProducts(productList);

        const orderSnapshot = await getDocs(collection(db, 'orders'));
        const ordersList = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const ordersWithNames = ordersList.map((order) => {
          const rawProducts = Array.isArray(order.products)
            ? order.products
            : [];

          const productsWithNames = rawProducts.map((p) => {
            const product = productList.find((prod) => prod.id === p.productId);
            return {
              ...p,
              name: product ? product.name : `Unknown (${p.productId})`,
              price: product ? product.price : 0,
            };
          });

          const total = productsWithNames.reduce(
            (sum, p) => sum + p.price * (p.quantity || 0),
            0
          );

          return {
            ...order,
            products: productsWithNames,
            total,
          };
        });

        setOrders(ordersWithNames);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (filter === 'priority') {
      filtered = filtered.filter(
        (o) => (o.status || '').toLowerCase() === 'in transit'
      );
    }

    if (filter === 'recent') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0)
      );
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const productsText = Array.isArray(order.products)
          ? order.products.map((p) => p.name).join(' ')
          : '';

        const text =
          (order.trackingNumber || '') +
          ' ' +
          (order.status || '') +
          ' ' +
          productsText;

        return text.toLowerCase().includes(term);
      });
    }

    return filtered;
  }, [orders, filter, searchTerm]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const inTransit = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'in transit'
    ).length;

    return { totalOrders, totalRevenue, inTransit };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Orders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all customer orders from Firebase.
            </p>
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="rounded-xl bg-white/80 backdrop-blur border border-orange-100 px-3 py-2 shadow-sm flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-orange-500" />
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Total Orders
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {summary.totalOrders}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur border border-emerald-100 px-3 py-2 shadow-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Total Revenue
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  ${summary.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur border border-blue-100 px-3 py-2 shadow-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  In Transit
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {summary.inTransit}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-orange-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70 focus:border-orange-400"
              placeholder="Search by tracking #, status, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                filter === 'priority'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100'
              }`}
              onClick={() => setFilter('priority')}
            >
              Priority (In Transit)
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                filter === 'recent'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100'
              }`}
              onClick={() => setFilter('recent')}
            >
              Most Recent
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                filter === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
              onClick={() => setFilter('all')}
            >
              Show All
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white/95 shadow-lg backdrop-blur-sm">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 text-left w-32">Tracking #</th>
                <th className="px-5 py-3 text-left w-[26%]">Products</th>
                <th className="px-5 py-3 text-left w-20">Qty</th>
                <th className="px-5 py-3 text-left w-24">Total</th>
                <th className="px-5 py-3 text-left w-28">Status</th>
                <th className="px-5 py-3 text-left w-40">Estimated</th>
                <th className="px-5 py-3 text-left w-40">Last Update</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const productsNames = Array.isArray(order.products)
                    ? order.products.map((p) => p.name).join(', ')
                    : '—';
                  const quantities = Array.isArray(order.products)
                    ? order.products
                        .map((p) =>
                          typeof p.quantity === 'number'
                            ? p.quantity
                            : p.quantity || 0
                        )
                        .join(', ')
                    : '—';

                  return (
                    <tr
                      key={order.id}
                      className={`border-t border-orange-50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/40'
                      } hover:bg-orange-100/50 transition-colors`}
                    >
                      <td className="px-5 h-14 align-middle">
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block">
                          {order.trackingNumber || `#${order.id.slice(0, 6)}`}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span
                          className="text-xs sm:text-sm text-gray-800 truncate block"
                          title={productsNames}
                        >
                          {productsNames}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span
                          className="text-xs sm:text-sm text-gray-700 truncate block"
                          title={quantities}
                        >
                          {quantities}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          ${Number(order.total || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${statusBadgeClasses(
                            order.status
                          )}`}
                        >
                          {order.status || 'Unknown'}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span className="text-xs sm:text-sm text-gray-700 truncate block">
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </td>

                      <td className="px-5 h-14 align-middle">
                        <span className="text-xs sm:text-sm text-gray-700 truncate block">
                          {formatDate(order.lastUpdate)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
