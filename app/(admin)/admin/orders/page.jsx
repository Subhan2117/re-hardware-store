'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

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
          const productsWithNames = order.products.map((p) => {
            const product = productList.find((prod) => prod.id === p.productId);
            return {
              ...p,
              name: product ? product.name : `Unknown (${p.productId})`,
              price: product ? product.price : 0,
            };
          });

          const total = productsWithNames.reduce(
            (sum, p) => sum + (p.price * (p.quantity || 0)),
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

    if (filter === 'priority')
      filtered = filtered.filter((o) => o.status === 'In Transit');
    if (filter === 'recent')
      filtered = [...filtered].sort(
        (a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate)
      );

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((order) => {
        const text =
          order.trackingNumber +
          ' ' +
          order.status +
          ' ' +
          order.products.map((p) => p.name).join(' ');
        return text.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [orders, filter, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">All orders from Firebase</p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Search by tracking number, status, or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded-lg border ${
              filter === 'priority'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'text-orange-600 border-orange-600 hover:bg-orange-100'
            }`}
            onClick={() => setFilter('priority')}
          >
            Priority (In Transit)
          </button>

          <button
            className={`px-4 py-2 rounded-lg border ${
              filter === 'recent'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'text-orange-600 border-orange-600 hover:bg-orange-100'
            }`}
            onClick={() => setFilter('recent')}
          >
            Most Recent
          </button>

          <button
            className={`px-4 py-2 rounded-lg border ${
              filter === 'all'
                ? 'bg-gray-600 text-white border-gray-600'
                : 'text-gray-600 border-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('all')}
          >
            Show All
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3">Tracking #</th>
                <th className="px-6 py-3">Products</th>
                <th className="px-6 py-3">Quantities</th>
                <th className="px-6 py-3">Total ($)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Estimated Delivery</th>
                <th className="px-6 py-3">Last Update</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{order.trackingNumber}</td>
                    <td className="px-6 py-4">
                      {order.products.map((p) => p.name).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      {order.products.map((p) => p.quantity).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{order.status}</td>
                    <td className="px-6 py-4">{order.estimatedDelivery}</td>
                    <td className="px-6 py-4">{order.lastUpdate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
