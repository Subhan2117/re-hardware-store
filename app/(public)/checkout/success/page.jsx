'use client';
import { useCart } from '@/app/context/CartContext';
import { useEffect } from 'react';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart(); // 🔥 clear context + localStorage when success page loads
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment successful ✅</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase! You&apos;ll receive an email receipt
          shortly.
        </p>
        <a
          href="/store"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-black text-white text-sm"
        >
          Back to Store
        </a>
      </div>
    </main>
  );
}
