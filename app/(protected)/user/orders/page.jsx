'use client';
import React, { useState } from 'react';
import { Package, Truck, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrdersClient() {
  const [activeTab, setActiveTab] = useState('current');

  const currentOrders = [
    {
      id: 'ORD-2024-001',
      date: 'January 14, 2024',
      status: 'Shipped',
      tracking: 'TRK123456789',
      estimated: 'Jan 18, 2024',
      total: '$249.97',
      items: [
        {
          name: 'DeWalt 20V Cordless Drill Kit',
          price: '$149.99',
          qty: 1,
          img: '/images/drill.jpg',
        },
        {
          name: 'Milwaukee Impact Driver Set',
          price: '$99.98',
          qty: 1,
          img: '/images/driver.jpg',
        },
      ],
    },
  ];

  const previousOrders = [
    {
      id: 'ORD-2024-002',
      date: 'January 10, 2024',
      status: 'Delivered',
      tracking: 'TRK987654321',
      estimated: 'Jan 13, 2024',
      total: '$129.49',
      items: [
        {
          name: 'Makita Circular Saw Kit',
          price: '$129.49',
          qty: 1,
          img: '/images/saw.jpg',
        },
      ],
    },
  ];

  const orders = activeTab === 'current' ? currentOrders : previousOrders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
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
            Current Orders (1)
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`px-6 py-2 ml-2 rounded-full text-sm font-semibold transition ${
              activeTab === 'previous'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            Previous Orders (1)
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 transition hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    Ordered on {order.date}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-700'
                      : order.status === 'Delivered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-4 py-4"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p className="font-bold text-gray-700">{item.price}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2 text-sm">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold text-gray-700">
                      Tracking Number:
                    </span>{' '}
                    {order.tracking}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      Estimated Delivery:
                    </span>{' '}
                    {order.estimated}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">Total</p>
                  <p className="text-lg font-bold text-orange-600">
                    {order.total}
                  </p>
                </div>
              </div>

              {/* BUTTONS FOR TRACKING */}
              <div className="flex justify-between mt-6">
                <Link href="/tracking" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Truck className="h-4 w-4" />
                Track Order
                </Link>
              </div>
            </div>
          ))}

          {!orders.length && (
            <div className="text-center py-20 text-gray-500">
              No {activeTab} orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
