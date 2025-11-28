'use client';

import { useMemo } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';
import { calculateTotals } from '@/app/(public)/cart/page';
import { useCart } from '@/app/context/CartContext';
import { getAuth } from 'firebase/auth';

export default function CheckoutClient() {
  const { cart, addToCart, setCart } = useCart();

  // Build items array from cart
  const items = useMemo(() => {
    return Object.values(cart || {})
      .map((entry) => entry?.product ? { ...entry.product, quantity: entry.quantity } : null)
      .filter(Boolean);
  }, [cart]);

  const { subtotal, shipping, tax, total } = calculateTotals(items || []);

  // Read saved checkout info (from your shipping/contact form)
  const contact = (() => {
    try { return JSON.parse(localStorage.getItem('checkoutContact')) || {}; }
    catch { return {}; }
  })();

  const shippingDetails = (() => {
    try { return JSON.parse(localStorage.getItem('checkoutShipping')) || {}; }
    catch { return {}; }
  })();

  // Build minimal Stripe item list
  const minimalItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  // -------------------------------------------------------------------
  // HANDLE STRIPE CHECKOUT
  // -------------------------------------------------------------------
  const handleStripeCheckout = async () => {
    try {
      if (!items.length) {
        alert("Your cart is empty");
        return;
      }

      // 1. Create pending Firestore order BEFORE Stripe
      const trackingNumber = `HW${Date.now().toString().slice(-9)}`;
      const auth = getAuth();
      const userId = auth?.currentUser?.uid || null;

      // Build full customer object for Firestore + FedEx
      const customer = {
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address: {
          street: shippingDetails.street || "",
          city: shippingDetails.city || "",
          state: shippingDetails.state || "",
          zip: shippingDetails.zip || "",
          country: shippingDetails.country || "US",
        },
      };

      const orderPayload = {
        trackingNumber,
        orderId: trackingNumber,
        sessionId: null,               // updated after Stripe
        status: "Pending",
        products: minimalItems.map(it => ({
          productId: it.id,
          quantity: it.quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
        customer,                      // <-- user name + email + address stored
        userId,
        createdAt: serverTimestamp(),
      };

      // Save order in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderPayload);
      const firestoreDocId = docRef.id;

      console.log("Pending Firestore order created:", firestoreDocId);

      // 2. Create Stripe Checkout Session
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: minimalItems,
          shipping,
          tax,
          contact,
          shippingDetails,
          orderId: firestoreDocId,    // passed to webhook
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error || "Unable to start checkout");
        return;
      }

      // 3. Update Firestore order with Stripe sessionId
      const sessionId = data.id;

      await updateDoc(doc(db, "orders", firestoreDocId), {
        sessionId,
        trackingNumber: sessionId, // you want sessionId to be tracking number
      });

      console.log("Updated Firestore order with sessionId:", sessionId);

      // store tracking number for Success Page
      localStorage.setItem("lastOrderTracking", sessionId);

      // 4. Redirect to Stripe
      window.location.href = data.url;

    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert("Something went wrong starting checkout.");
    }
  };

  // Quantity controls
  const handleIncrement = (item) => addToCart(item);
  const handleDecrement = (id) => {
    setCart(prev => {
      const entry = prev[id];
      if (!entry) return prev;
      const newQty = entry.quantity - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...entry, quantity: newQty } };
    });
  };

  // If empty
  if (!items.length) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/60 to-amber-100 pt-28 pb-16">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Your cart is empty
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Add some tools and hardware to start shopping.
          </p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------
  // ORIGINAL TEMPLATE (UNTOUCHED BELOW)
  // -------------------------------------------------------------------
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/60 to-amber-100 pt-28 pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="flex flex-col gap-3 border-b border-orange-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Checkout</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">Review your order</h1>
            <p className="mt-1 text-sm text-slate-600">
              You'll enter your shipping and payment details securely on the next step.
            </p>
          </div>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-orange-100">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-[0.7rem] font-semibold">
              {items.length}
            </span>
            {items.length === 1 ? "Item in cart" : "Items in cart"}
          </div>
        </header>

        {/* LAYOUT  */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] items-start">

          {/* LEFT: ORDER SUMMARY */}
          <aside className="order-2 lg:order-1 h-max rounded-2xl border border-orange-100 bg-white/95 p-6 shadow-lg lg:sticky lg:top-28">
            <h3 className="text-xl font-semibold text-slate-900">Order Summary</h3>
            <p className="mt-1 text-xs text-slate-500">Adjust quantities and review your total before continuing.</p>

            {/* CART ITEMS */}
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 rounded-xl shadow-sm">
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>

                    <div className="mt-2 inline-flex items-center gap-2 bg-white px-2 py-1 rounded-full text-xs shadow-inner">
                      <button onClick={() => handleDecrement(item.id)} className="h-6 w-6 flex items-center justify-center rounded-full border text-slate-700">−</button>
                      <span className="w-8 text-center font-semibold text-slate-900">{item.quantity}</span>
                      <button onClick={() => handleIncrement(item)} className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 text-white">+</button>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            {/* TOTALS */}
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 border-t pt-4 flex justify-between text-lg font-semibold">
              <span>Total Due</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleStripeCheckout}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-md"
            >
              Continue to secure payment
            </button>
          </aside>

          {/* RIGHT: INFO CARD */}
          <div className="order-1 lg:order-2 space-y-5">
            <section className="rounded-2xl border bg-white/90 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">You're almost done</h2>
              <p className="mt-2 text-sm text-slate-600">
                Stripe securely handles your payment details...
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
