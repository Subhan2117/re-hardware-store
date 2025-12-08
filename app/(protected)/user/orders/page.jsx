'use client';

import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';
import { useAuth } from '@/app/api/login/context/AuthContext';

// ✅ Helper: safely get a JS Date from multiple possible fields
function getOrderDate(order) {
  const ts = order.createdAt || order.created; // check both

  if (!ts) return null;

  // Firestore Timestamp
  if (typeof ts?.toDate === 'function') return ts.toDate();

  // Epoch millis
  if (typeof ts === 'number') return new Date(ts);

  // Firestore-like {seconds}
  if (typeof ts === 'object' && ts.seconds) return new Date(ts.seconds * 1000);

  // ISO string or anything Date can parse
  return new Date(ts);
}

// ✅ Time filter helper
function isOrderInRange(order, timeFilter) {
  const date = getOrderDate(order);

  // If we don't have a date, ONLY show it in "All" view
  if (!date) return timeFilter === 'all';
  if (timeFilter === 'all') return true;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  switch (timeFilter) {
    case '24h':
      return diffMs <= dayMs;
    case '7d':
      return diffMs <= 7 * dayMs;
    case '30d':
      return diffMs <= 30 * dayMs;
    default:
      return true;
  }
}

export default function OrdersClient() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'previous'
  const [timeFilter, setTimeFilter] = useState('7d'); // '24h' | '7d' | '30d' | 'all'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});
  const [copiedTrackingId, setCopiedTrackingId] = useState(null);

  // Fetch user orders
  useEffect(() => {
    if (currentUser === undefined) return;

    if (currentUser === null) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerDetails.email', '==', currentUser.email)
        );
        const snapshot = await getDocs(q);

        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Sort by date (newest first)
        fetched.sort((a, b) => {
          const aDate = getOrderDate(a)?.getTime() ?? 0;
          const bDate = getOrderDate(b)?.getTime() ?? 0;
          return bDate - aDate;
        });

        setOrders(fetched);

        // ✅ product images map
        const productSnapshot = await getDocs(collection(db, 'products'));
        const imagesMap = {};
        productSnapshot.forEach((doc) => {
          const data = doc.data();
          imagesMap[data.name] = data.image || data.img || data.picture || '';
        });
        setProductImages(imagesMap);
      } catch (e) {
        console.error('Error fetching orders:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Split current vs previous
  const currentOrders = orders.filter((o) => o.status !== 'Delivered');
  const previousOrders = orders.filter((o) => o.status === 'Delivered');

  const baseList = activeTab === 'current' ? currentOrders : previousOrders;

  // ✅ Apply time filter here
  const display = baseList.filter((o) => isOrderInRange(o, timeFilter));

  const handleCopyTracking = async (trackingNumber, orderId) => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopiedTrackingId(orderId);
      setTimeout(() => setCopiedTrackingId(null), 2000);
    } catch (e) {
      console.error('Failed to copy tracking number:', e);
    }
  };

  const timeFilterLabel = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    all: 'All time',
  }[timeFilter];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <Package className="text-orange-600 h-6 w-6" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                My Orders
              </h1>
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-gray-600">
              Track and manage your hardware orders.
            </p>
            <p className="text-xs text-gray-400">
              Viewing:{' '}
              <span className="font-medium text-gray-600">{timeFilterLabel}</span>
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === 'current'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            Current Orders ({currentOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('previous')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === 'previous'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            Previous Orders ({previousOrders.length})
          </button>
        </div>

        {/* Time Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { key: '24h', label: 'Last 24 hrs' },
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
            { key: 'all', label: 'All' },
          ].map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeFilter(tf.key)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition ${
                timeFilter === tf.key
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-orange-50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            <Clock className="h-6 w-6 mx-auto mb-3 animate-spin" />
            Loading your orders...
          </div>
        )}

        {/* Orders List */}
        {!loading && (
          <div className="space-y-8">
            {display.map((order) => {
              const orderDate = getOrderDate(order);
              const dateLabel = orderDate
                ? orderDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Unknown';

              const itemsCount = order.items?.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-orange-100 bg-white/80 shadow-sm p-6 hover:shadow-md hover:border-orange-200 transition"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        Order #{order.id}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Ordered on {dateLabel} · {itemsCount || 0} item
                        {itemsCount === 1 ? '' : 's'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Truck className="h-3 w-3" />
                        {order.status || 'Processing'}
                      </span>
                      {order.total && (
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                            Total
                          </p>
                          <p className="text-lg font-semibold text-orange-600">
                            ${Number(order.total).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 py-4"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={productImages[item.name] || item.img || '/file.svg'}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}{' '}
                            <span className="mx-1 text-gray-300">•</span> Price: $
                            {item.price}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Line Total
                          </p>
                          <p className="font-semibold text-gray-800">
                            $
                            {(
                              (Number(item.price) || 0) *
                              (Number(item.quantity) || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-4 mt-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-semibold text-gray-700">
                          Tracking Number:
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                          {order.trackingNumber || 'N/A'}
                        </span>
                        {order.trackingNumber && (
                          <button
                            onClick={() =>
                              handleCopyTracking(order.trackingNumber, order.id)
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedTrackingId === order.id ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Link
                        href="/tracking"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <Truck className="h-4 w-4" />
                        Track Order
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {!display.length && (
              <div className="text-center py-20 text-gray-500">
                No {activeTab} orders in the selected period.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
