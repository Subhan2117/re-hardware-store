'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { db } from '@/app/api/firebase/firebase';

import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const STATUS_FLOW = ["paid", "label_created", "in_transit", "out_for_delivery", "delivered"];

function getNextStatus(current) {
  const i = STATUS_FLOW.indexOf(current);
  if (i === -1 || i === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

function formatStatus(status) {
  return status
    .replace(/_/g, ' ') // replace all underscores
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
    .join(' ');
}

export default function ClientTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState([]);
  const intervalRef = useRef(null);
  const orderRefState = useRef(null);

  useEffect(() => {
    orderRefState.current = searchedOrder;
  }, [searchedOrder]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Auto-update order status
  useEffect(() => {
    if (!searchedOrder) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const currentOrder = orderRefState.current;
      if (!currentOrder) return;

      const nextStatus = getNextStatus(currentOrder.status);
      if (!nextStatus) {
        clearInterval(intervalRef.current);
        return;
      }

      const newEvent = { status: nextStatus, timestamp: Date.now() };

      const orderDocRef = doc(db, 'orders', currentOrder.docId);
      const updatedEvents = [...(currentOrder.events || []), newEvent];

      await updateDoc(orderDocRef, {
        status: nextStatus,
        events: updatedEvents
      }).catch(err => console.error('Firestore update error:', err));

      setSearchedOrder(prev => ({
        ...prev,
        status: nextStatus,
        events: updatedEvents
      }));
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [searchedOrder?.docId]);

  const handleSearch = async e => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchedOrder(null);

    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const orderDoc = snapshot.docs.find(d =>
        d.data().trackingNumber?.toLowerCase() === trackingNumber.toLowerCase()
      );

      if (!orderDoc) {
        setNotFound(true);
        setIsSearching(false);
        return;
      }
      const orderData = orderDoc.data();
      const productPromises = (orderData.products ?? []).map(async item => {
        const prodSnap = await getDoc(doc(db, 'products', item.productId));
        return prodSnap.exists() ? { id: prodSnap.id, quantity: item.quantity, ...prodSnap.data() } : null;
      });

      const productsInOrder = (await Promise.all(productPromises)).filter(Boolean);
      const initialEvent = { status: orderData.status, timestamp: orderData.createdAt?.toMillis() || Date.now() };

      setSearchedOrder({
        docId: orderDoc.id,
        orderId: orderData.orderId,
        ...orderData,
        products: productsInOrder,
        events: [initialEvent],
        status: orderData.status
      });
    } catch (err) {
      console.error(err);
      setNotFound(true);
      setSearchedOrder(null);
    }

    setIsSearching(false);
  };

  return (
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

      {searchedOrder && (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Order #{searchedOrder.orderId}</h2>
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-semibold text-lg">Order Status</h3>
              <p className="text-gray-800 font-medium mt-2">
                Status: <span className="font-semibold capitalize">{searchedOrder.status}</span>
              </p>
              {searchedOrder.events?.map((ev, i) => (
                <p key={i} className="text-gray-600 text-sm">
                  {new Date(ev.timestamp).toLocaleTimeString()} — <span className="capitalize">{formatStatus(ev.status)}</span>
                </p>
              ))}
            </div>
            <p className="text-gray-600 mt-1 text-sm">
              Order placed: {searchedOrder?.createdAt?.toDate().toLocaleDateString()}
            </p>
            <p className="text-gray-600 mt-1 text-sm">
              Estimated Delivery: {
                searchedOrder?.createdAt &&
                new Date(
                  searchedOrder.createdAt.toDate().getTime() + 5 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()
              }
            </p>
          </div>

          <div className="space-y-4">
            {searchedOrder.products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 border-t pt-4 first:border-t-0 first:pt-0"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-gray-700 text-sm">{p.description}</p>
                  <p className="text-gray-900 font-semibold mt-1">
                    ${p.price} x {p.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notFound && (
        <p className="text-red-600 font-semibold text-center">
          No order found for “{trackingNumber}”.
        </p>
      )}
    </main>
  );
}
