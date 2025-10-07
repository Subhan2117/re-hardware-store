'use client';
import React, { useState } from 'react';
import Navbar from '@/app/component/Navbar';
import { Search } from 'lucide-react';
import { mockProducts } from '@/app/mock-data/mockProducts';
import { mockOrders } from '@/app/mock-data/mockOrders';

export default function Page() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Search only mockOrders by orderId
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchedOrder(null);

    await new Promise((resolve) => setTimeout(resolve, 400)); // simulate delay

    const order = mockOrders.find(
      (o) => o.orderId.toLowerCase() === trackingNumber.toLowerCase()
    );

    if (!order) {
      setNotFound(true);
      setSearchedOrder(null);
    } else {
      const product = mockProducts.find((p) => p.id === order.productId);
      setSearchedOrder({ ...order, ...product });
    }

    setIsSearching(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200">
      <Navbar />

      {/* Header */}
      <div className="mt-20 text-center">
        <header className="relative z-10 py-10">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Track Your Order
          </h1>
          <p className="text-base font-semibold text-gray-800">
            Enter your tracking number to view your order status.
          </p>
        </header>
      </div>

      {/* Search */}
      <main className="flex-grow flex flex-col items-center px-4 space-y-8 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !trackingNumber.trim()}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition 
                ${
                  isSearching || !trackingNumber.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90'
                }`}
            >
              {isSearching ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Search Result */}
        {searchedOrder && (
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 flex items-center gap-6">
            <img
              src={searchedOrder.image}
              alt={searchedOrder.name}
              className="w-28 h-28 object-cover rounded-md border"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchedOrder.name}
              </h2>
              <p className="text-gray-700 mt-1">{searchedOrder.description}</p>
              <p className="mt-2 font-semibold text-gray-900">
                ${searchedOrder.price}
              </p>
              <p
                className={`mt-1 font-semibold ${
                  searchedOrder.status === 'in_transit'
                    ? 'text-green-600'
                    : searchedOrder.status === 'out_for_delivery'
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >
                {searchedOrder.status.replace('_', ' ')}
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                Estimated Delivery: {searchedOrder.estimatedDelivery}
              </p>
            </div>
          </div>
        )}

        {notFound && (
          <p className="text-red-600 font-semibold text-center">
            No order found for “{trackingNumber}”.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-300 bg-white/70 backdrop-blur">
        <div className="text-center py-6 text-gray-700 text-sm">
          © 2025 Family Hardware Store • Need help? Call (555) 123-4567
        </div>
      </footer>
    </div>
  );
}
