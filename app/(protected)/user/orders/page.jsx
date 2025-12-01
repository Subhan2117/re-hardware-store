'use client';

import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase'; 
import { useAuth } from '@/app/api/login/context/AuthContext';

export default function OrdersClient() {
  const { currentUser } = useAuth(); 
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: store product images
  const [productImages, setProductImages] = useState({});

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
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // ✅ NEW: Fetch product images from "products"
      const productSnapshot = await getDocs(collection(db, "products"));
      let imagesMap = {};

      productSnapshot.forEach(doc => {
        const data = doc.data();
        imagesMap[data.name] = data.image || data.img || data.picture;
      });

      setProductImages(imagesMap);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [currentUser]);


  // Separate current vs previous
  const currentOrders = orders.filter(
    (o) => o.status !== 'Delivered'
  );
  const previousOrders = orders.filter(
    (o) => o.status === 'Delivered'
  );

  const display = activeTab === 'current'
    ? currentOrders
    : previousOrders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white mt-15">
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

          <p className="text-sm text-gray-600 text-right">
            Track and manage your hardware orders.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
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
            className={`px-6 py-2 ml-2 rounded-full text-sm font-semibold transition ${
              activeTab === 'previous'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            Previous Orders ({previousOrders.length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            <Clock className="h-6 w-6 mx-auto mb-3 animate-spin" />
            Loading your orders...
          </div>
        )}

        {/* Orders */}
        {!loading && (
          <div className="space-y-8">
            {display.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Ordered on {order.createdAt?.toDate?.().toLocaleDateString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {order.status || 'Processing'}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 py-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={productImages[item.name] || item.img}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>

                      <p className="font-bold text-gray-700">${item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2 text-sm">
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold text-gray-700">
                        Tracking Number:
                      </span>{' '}
                      {order.trackingNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-700">Total</p>
                    <p className="text-lg font-bold text-orange-600">
                      ${order.total || '0.00'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Link
                    href={`/tracking`}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Truck className="h-4 w-4" />
                    Track Order
                  </Link>
                </div>
              </div>
            ))}

            {!display.length && (
              <div className="text-center py-20 text-gray-500">
                No {activeTab} orders found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
