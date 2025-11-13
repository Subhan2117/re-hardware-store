'use client';
import Navbar from '@/app/component/Navbar';
import { useMemo } from 'react';
import { calculateTotals } from '@/app/(public)/cart/page';
import { useCart } from '@/app/context/CartContext';
import { mockProducts } from '@/app/mock-data/mockProducts.jsx';

export default function CheckoutClient() {
  // BELOW IS NEEDED TO CALCULATE ITEM COST AGAIN
  const { cart } = useCart();

  const items = useMemo(() => {
    return Object.values(cart || {})
      .map((entry) => {
        if (!entry?.product) return null;
        return {
          ...entry.product,
          quantity: entry.quantity,
        };
      })
      .filter(Boolean);
  }, [cart]);

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
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* LEFT COLUMN: your three sections (unchanged content) */}
          <div className="grid gap-6">
            {/* 1. FIRST NAME FORM */}
            <section className="rounded-2xl border bg-white/80 shadow-sm backdrop-blur p-5 md:p-6">
              <header className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                  1
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                  <p className="text-sm text-slate-500">
                    We’ll use this to send order updates
                  </p>
                </div>
              </header>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-slate-700"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      autoComplete="given-name"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  {/*LAST NAME*/}
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-slate-700"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      autoComplete="family-name"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping address */}
            <section className="rounded-2xl border bg-white/80 shadow-sm backdrop-blur p-5 md:p-6">
              <header className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <p className="text-sm text-slate-500">
                    Where do we ship your order to?
                  </p>
                </div>
              </header>

              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="street"
                    className="text-sm font-medium text-slate-700"
                  >
                    Street Address
                  </label>
                  <input
                    id="street"
                    name="street"
                    placeholder="123 Main Street"
                    autoComplete="address-line1"
                    className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="city"
                      className="text-sm font-medium text-slate-700"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      placeholder="New York"
                      autoComplete="address-level2"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="state"
                      className="text-sm font-medium text-slate-700"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      placeholder="NY"
                      autoComplete="address-level1"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="zip"
                      className="text-sm font-medium text-slate-700"
                    >
                      ZIP Code
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      placeholder="10001"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* CARD INFO */}
            <section className="rounded-2xl border bg-white/80 shadow-sm backdrop-blur p-5 md:p-6">
              <header className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Payment Details</h2>
                  <p className="text-sm text-slate-500">Card Information</p>
                </div>
              </header>

              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="street"
                    className="text-sm font-medium text-slate-700"
                  >
                    Card Number
                  </label>
                  <input
                    id="Card Number"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                    className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="street"
                    className="text-sm font-medium text-slate-700"
                  >
                    Card Name Holder
                  </label>
                  <input
                    id="Card Holder Name"
                    name="cardName"
                    placeholder="John Doe"
                    autoComplete="cc-name"
                    className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="city"
                      className="text-sm font-medium text-slate-700"
                    >
                      Expire Date
                    </label>
                    <input
                      id="Expiration"
                      name="cardExp"
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      input="date"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="zip"
                      className="text-sm font-medium text-slate-700"
                    >
                      CCV
                    </label>
                    <input
                      id="CCV"
                      name="cardCvc"
                      placeholder="345"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      className="w-full rounded-xl border bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <aside className="h-max rounded-2xl border bg-white/80 shadow-sm backdrop-blur p-5 md:p-6 md:sticky md:top-24">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            {/* HERE WOULD GO THE LIST OF THINGS WE ARE BUYING*/}

            <hr className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>

            <hr className="my-4" />

            <div className="text-base font-semibold flex items-center justify-between">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                Free returns within 30 days
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                Secure payment processing
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                Ships within 2–3 business days
              </li>
            </ul>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3 text-white font-semibold shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Place Order
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
