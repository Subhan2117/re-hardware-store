'use client';

import { useCart } from '@/app/context/CartContext';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const [trackingNumber, setTrackingNumber] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read tracking number from localStorage (set earlier in checkout)
    try {
      const tn = localStorage.getItem('lastOrderTracking');
      if (tn) setTrackingNumber(tn);
    } catch (e) {
      console.warn('Could not read lastOrderTracking from localStorage', e);
    }

    // Clear the cart (context + localStorage) when success page loads
    clearCart();
  }, []);

  const handleCopy = async () => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed', e);
      alert('Copy failed — you can select and copy the number manually.');
    }
  };

  const fedexTrackUrl = trackingNumber
    ? `https://www.fedex.com/apps/fedextrack/?tracknumbers=${encodeURIComponent(trackingNumber)}`
    : '#';

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="max bg-white rounded-2xl shadow p-6 text-center">
        {/* Bigger heading */}
        <h1 className="text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-4 text-base">
          Thank you for your purchase! You&apos;ll receive an email receipt shortly.
        </p>

        {trackingNumber ? (
          <div className="mb-4">
            <p className="text-sm text-slate-800 mb-2">
              <strong>Your tracking number</strong>
            </p>
            <div className="inline-flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2">
              <span className="font-mono text-sm font-semibold text-slate-900">
                {trackingNumber}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 rounded-md text-sm border border-slate-200 bg-white hover:bg-slate-100"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-600">
            We couldn&apos;t find a tracking number right now. It should appear in your order email shortly.
          </p>
        )}

        <a
          href="/store"
          className="inline-block mt-4 px-5 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-slate-800 transition"
        >
          Back to Store
        </a>
      </div>
    </main>
  );
}
