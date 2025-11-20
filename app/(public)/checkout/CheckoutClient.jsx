'use client';

import { useMemo } from 'react';
import { calculateTotals } from '@/app/(public)/cart/page';
import { useCart } from '@/app/context/CartContext';

export default function CheckoutClient() {
  const { cart, addToCart, setCart } = useCart();

  const items = useMemo(() => {
    return Object.values(cart || {})
      .map((entry) => {
        if (!entry?.product) return null;
        return {
          ...entry.product,
          quantity: entry.quantity,
        };
      })
      .filter(Boolean) ;
  }, [cart]);

  const { subtotal, shipping, tax, total } = calculateTotals(items || []);

  const handleStripeCheckout = async () => {
    try {
      if (!items.length) {
        alert('Your cart is empty');
        return;
      }

      const minimalItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: minimalItems,
          shipping,
          tax,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout session error:', data);
        alert(data.error || 'Unable to start checkout');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert('Something went wrong starting checkout');
    }
  };

  // Quantity controls
  const handleIncrement = (item) => {
    // addToCart uses product shape; item already includes id, name, price, etc.
    addToCart(item);
  };

  const handleDecrement = (id) => {
    setCart((prev) => {
      const entry = prev[id];
      if (!entry) return prev;

      const newQty = entry.quantity - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [id]: {
          ...entry,
          quantity: newQty,
        },
      };
    });
  };

  // Empty state
  if (!items.length) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/60 to-amber-100 pt-28 pb-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Add some tools and hardware to your cart before heading to checkout.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/60 to-amber-100 pt-28 pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="flex flex-col gap-3 border-b border-orange-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Checkout
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Review your order
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              You&apos;ll enter your shipping and payment details securely on the next step.
            </p>
          </div>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-orange-100">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[0.7rem] font-semibold text-white">
              {items.length}
            </span>
            <span>{items.length === 1 ? 'Item in cart' : 'Items in cart'}</span>
          </div>
        </header>

        {/* Layout: Order Summary bigger on left, info on right */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
          {/* ORDER SUMMARY — main focus */}
          <aside className="order-2 h-max rounded-2xl border border-orange-100 bg-white/95 p-6 shadow-lg backdrop-blur-sm transition-transform duration-200 lg:sticky lg:top-28 lg:order-1">
            <h3 className="text-xl font-semibold text-slate-900">
              Order Summary
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Adjust quantities and review your total before continuing.
            </p>

            {/* Cart items list with quantity controls */}
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ${Number(item.price).toFixed(2)} each
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 text-xs shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 active:scale-95"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(item)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-slate-900">
                  ${shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium text-slate-900">
                  ${tax.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-lg font-semibold text-slate-900">
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                You&apos;ll see this total again on the Stripe payment page before confirming.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStripeCheckout}
              disabled={!items.length}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-transform transition-colors duration-200 hover:from-orange-700 hover:to-amber-600 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-amber-50"
            >
              Continue to secure payment
            </button>
          </aside>

          {/* INFO CARD — secondary, on right */}
          <div className="order-1 space-y-5 lg:order-2">
            <section className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">
                You&apos;re almost done
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                On the next step you&apos;ll complete your purchase using Stripe Checkout. Stripe
                securely handles your payment details and supports card payments as well as Apple Pay
                and Google Pay when available on your device.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Review your items and total here before you pay.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Enter shipping and payment details securely on Stripe.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Receive an order confirmation immediately after payment.
                </li>
              </ul>

              <p className="mt-3 text-xs text-slate-500">
                We never store your full card information. All payments are processed by Stripe using
                industry-standard encryption.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
