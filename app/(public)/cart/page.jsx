'use client';

import Navbar from '@/app/component/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCart } from '@/app/context/CartContext';
// Adjust this import to your actual product source:
import { mockProducts } from '@/app/mock-data/mockProducts.jsx';

const TAX_RATE = 0.085;
const SHIPPING_FLAT = 12.99;

export function calculateTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = items.length > 0 ? SHIPPING_FLAT : 0;
  const tax = subtotal * TAX_RATE;
  const total = +(subtotal + shipping + tax).toFixed(2);
  return { subtotal, shipping, tax, total };
}

export default function Page() {
  const { cart, addToCart, setCart } = useCart();

  // helpers available in context-style:
  const increment = (product) => addToCart(product);
  const decrement = (product) => {
    setCart((prev) => {
      const current = prev[product.id] || 0;
      if (current <= 1) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: current - 1 };
    });
  };
  const remove = (productId) => {
    setCart((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };
  const clear = () => setCart({});

  // Build a quick lookup for products
  const productById = useMemo(() => {
    const map = {};
    (mockProducts || []).forEach((p) => (map[p.id] = p));
    return map;
  }, []);

  // Expand cart {id: qty} -> array of line items with product info
  const items = useMemo(() => {
    return Object.entries(cart || {})
      .map(([id, qty]) => {
        const p = productById[id];
        if (!p) return null; // product might have been removed from catalog
        return { ...p, quantity: qty };
      })
      .filter(Boolean);
  }, [cart, productById]);

  // Totals
  const { subtotal, shipping, tax, total } = calculateTotals(items);

  return (
    <div>
      <main
        style={{
          backgroundColor: '#FAEBD7',
          minHeight: '100vh',
          paddingTop: '150px',
          paddingLeft: '50px',
          paddingRight: '50px',
          color: 'black',
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-4xl font-bold md:font-extrabold mb-2">
            Shopping Cart
          </h1>
          <p className="text-black/70">
            Please review your items and proceed to checkout
          </p>
        </div>

        {/* Empty state */}
        {!items.length && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
            <p className="text-lg font-medium mb-4">Your cart is empty.</p>
            <Link
              href="/store"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5 transition"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Items */}
            <section className="lg:col-span-2 space-y-6">
              {items.map((item) => {
                const lineTotal = (item.price * item.quantity).toFixed(2);
                const canDecrement = item.quantity > 1;
                const canIncrement = item.inStock && item.quantity < item.stock;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/10 bg-white p-4 md:p-6 shadow-sm"
                  >
                    <div className="flex gap-4 md:gap-6 items-start">
                      {/* Image */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black/5 shrink-0">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg md:text-xl truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-black/60 mt-1">
                              SKU: {item.sku || item.id}
                            </p>
                            <p className="text-sm text-black/70 mt-1">
                              {item.inStock
                                ? `${item.stock} in stock`
                                : 'Out of stock'}
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => remove(item.id)}
                            className="text-sm text-black/60 hover:text-black rounded-lg px-2 py-1"
                            aria-label={`Remove ${item.name}`}
                          >
                            Remove
                          </button>
                        </div>

                        {/* Qty + line total */}
                        <div className="mt-4 flex items-end justify-between">
                          <div className="inline-flex items-center gap-2 bg-black/5 rounded-xl p-1">
                            <button
                              className="h-9 w-9 inline-flex items-center cursor-pointer justify-center rounded-lg select-none disabled:opacity-40"
                              onClick={() => decrement(item)}
                              disabled={!canDecrement}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="h-9 w-9 inline-flex items-center cursor-pointer justify-center rounded-lg select-none disabled:opacity-40"
                              onClick={() => increment(item)}
                              disabled={!canIncrement}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xl md:text-2xl font-extrabold">
                              ${lineTotal}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-black/60">
                                ${item.price} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Actions under list */}
              <div className="flex items-center gap-3">
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5 transition"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={clear}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5 transition"
                >
                  Clear Cart
                </button>
              </div>
            </section>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-1 space-y-4">
              <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-6 shadow">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  <hr className="border-black/10" />

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-3xl font-extrabold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link href={'/checkout'}>
                  <button className="w-full mb-5 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-white font-semibold hover:opacity-90 active:opacity-80 transition">
                    Proceed to Checkout
                  </button>
                </Link>

                {/* Promo Code (non-functional placeholder) */}
                <div>
                  <label
                    htmlFor="promo"
                    className="block text-sm font-medium mb-2"
                  >
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="promo"
                      placeholder="Enter code"
                      className="flex-1 rounded-xl border border-black/15 px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
                    />
                    <button className="rounded-xl cursor-pointer border border-black/15 px-4 py-2 font-medium hover:bg-black/5">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
