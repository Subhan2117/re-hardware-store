'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { db } from '@/app/api/firebase/firebase';

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ClientTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchedOrder(null);

    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orderDoc = ordersSnapshot.docs.find(
        (d) =>
          d.data().trackingNumber?.toLowerCase() ===
          trackingNumber.toLowerCase()
      );

      if (!orderDoc) {
        setNotFound(true);
        setIsSearching(false);
        return;
      }
      const orderData = orderDoc.data();

      let fedexTracking = null;
      try {
        const fedexResp = await fetch("/api/fedex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber }),
        });

        const fedexData = await fedexResp.json();
        if (fedexData.success) {
          fedexTracking = fedexData.trackingData;
        }
      } catch (err) {
        console.error("FedEx tracking error:", err);
      }

      const productPromises = (orderData.products ?? []).map(async (item) => {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          return {
            id: productSnap.id,
            quantity: item.quantity,
            ...productSnap.data(),
          };
        } else {
          return null;
        }
      });

      const productsInOrder = (await Promise.all(productPromises)).filter(
        Boolean
      );

      setSearchedOrder({
        ...orderData,
        products: productsInOrder,
        fedex: fedexTracking,
      });
    } catch (err) {
      console.error('Error fetching order data:', err);
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
            <h2 className="text-2xl font-semibold text-gray-900">
              Order #{searchedOrder.orderId}
            </h2>
            {/* FedEx Tracking UI */}
            {searchedOrder.fedex && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold text-lg">FedEx Tracking</h3>

                <p className="text-gray-700 font-medium mt-2">
                  Status:{" "}
                  {searchedOrder.fedex.output?.completeTrackResults?.[0]?.trackResults?.[0]
                    ?.latestStatusDetail?.statusByLocale || "Unknown"}
                </p>

                <p className="text-gray-600 mt-1 text-sm">
                  Location:{" "}
                  {(() => {
                    const loc =
                      searchedOrder.fedex.output?.completeTrackResults?.[0]?.trackResults?.[0]
                        ?.latestStatusDetail?.scanLocation;

                    if (!loc) return "No location available";

                    return `${loc.city ?? ""}, ${loc.stateOrProvinceCode ?? ""} ${loc.countryName ?? ""}`;
                  })()}

                </p>

                <p className="text-gray-600 mt-1 text-sm">
                  Last Updated:{" "}
                  {searchedOrder.fedex.output?.completeTrackResults?.[0]?.trackResults?.[0]
                    ?.latestStatusDetail?.dateAndTime || "Unavailable"}
                </p>
              </div>
            )}
            <div className="mt-1">
              {(() => {
                const fedexStatus =
                  searchedOrder.fedex?.output?.completeTrackResults?.[0]?.trackResults?.[0]
                    ?.latestStatusDetail?.statusByLocale || "Unknown";

                const color =
                  fedexStatus.includes("Transit") ? "text-blue-600" :
                  fedexStatus.includes("Delivery") ? "text-yellow-600" :
                  fedexStatus.includes("Delivered") ? "text-green-600" :
                  "text-red-600";

                return (
                  <p className={`mt-1 font-semibold ${color}`}>
                    {fedexStatus}
                  </p>
                );
              })()}
            </div>
            <p className="text-gray-600 mt-1 text-sm">
              Estimated Delivery: {searchedOrder.estimatedDelivery}
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
