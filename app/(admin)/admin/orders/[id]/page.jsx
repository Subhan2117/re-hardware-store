'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/app/api/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  PackageSearch,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

function formatDate(value) {
  if (!value) return '—';

  let d;
  if (typeof value?.toDate === 'function') {
    d = value.toDate();
  } else if (typeof value === 'number') {
    d = new Date(value);
  } else {
    d = new Date(value);
  }

  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'processing';
  const s = rawStatus.toLowerCase();

  if (s === 'paid' || s === 'label_created') return 'processing';
  if (s === 'in_transit') return 'in transit';
  if (s === 'out_for_delivery') return 'out for delivery';
  if (s === 'delivered') return 'delivered';
  return rawStatus;
}

function statusBadgeClasses(status) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (s === 'in transit' || s === 'shipped' || s === 'out for delivery')
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (s === 'processing' || s === 'paid' || s === 'label_created')
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (s === 'cancelled' || s === 'canceled')
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  return 'bg-gray-50 text-gray-700 border border-gray-200';
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // ✅ Support both [orderId] and [id] folder names
  const orderId = params?.orderId || params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // If there is no param at all, stop loading and show notFound
    if (!orderId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'orders', String(orderId));
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setNotFound(true);
          setOrder(null);
        } else {
          setOrder({ id: snap.id, ...snap.data() });
          setNotFound(false);
        }
      } catch (e) {
        console.error('Error fetching order details:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const computed = useMemo(() => {
    if (!order) return {};

    const events = Array.isArray(order.events) ? order.events : [];
    const sortedEvents = [...events].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    const latestEvent =
      sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null;

    const rawStatus =
      latestEvent?.status ||
      order.status ||
      order.paymentStatus ||
      'processing';

    const status = normalizeStatus(rawStatus);

    let lastUpdateMs = null;
    if (latestEvent?.timestamp) {
      lastUpdateMs = latestEvent.timestamp;
    } else if (order.updatedAt?.toDate) {
      lastUpdateMs = order.updatedAt.toDate().getTime();
    }

    const items =
      Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : Array.isArray(order.products)
        ? order.products.map((p) => ({
            name: p.name || `Product ${p.productId}`,
            quantity: p.quantity || 0,
            price: p.price || 0,
          }))
        : [];

    const subtotal =
      typeof order.subtotal === 'number'
        ? order.subtotal
        : items.reduce(
            (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
            0
          );

    const tax = Number(order.tax || 0);
    const shipping = Number(order.shipping || 0);
    const total = Number(order.total || subtotal + tax + shipping);

    return {
      status,
      rawStatus,
      sortedEvents,
      lastUpdateMs,
      items,
      subtotal,
      tax,
      shipping,
      total,
    };
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Clock3 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-800">
            Order not found.
          </p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center gap-2 text-sm text-orange-700 hover:text-orange-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const {
    status,
    sortedEvents,
    lastUpdateMs,
    items,
    subtotal,
    tax,
    shipping,
    total,
  } = computed;

  const shippingAddress = order.shippingAddress || order.address || {};
  const createdAtLabel = order.createdAt ? formatDate(order.createdAt) : '—';
  const lastUpdateLabel = lastUpdateMs
    ? formatDate(lastUpdateMs)
    : formatDate(order.updatedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

        <div className="text-right">
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-mono text-sm text-gray-900 truncate max-w-xs">
              {order.id}
            </p>
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-orange-100 bg-white/90 shadow-sm p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackageSearch className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Placed on {createdAtLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadgeClasses(
                status
              )}`}
            >
              {status}
            </span>
            <div className="text-right text-xs text-gray-500">
              <p>Last update: {lastUpdateLabel}</p>
              {order.trackingNumber && (
                <p className="mt-0.5">
                  Tracking:{' '}
                  <span className="font-mono text-gray-700">
                    {order.trackingNumber}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
          {/* Left column: items + timeline */}
          <div className="space-y-6">
            {/* Items */}
            <div className="rounded-2xl border border-orange-100 bg-white/95 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-orange-50 flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Items ({items.length})
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">
                  No items found on this order.
                </div>
              ) : (
                <div className="divide-y divide-orange-50">
                  {items.map((item, idx) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;
                    const lineTotal = qty * price;

                    return (
                      <div
                        key={idx}
                        className="px-5 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name || `Item ${idx + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {qty}{' '}
                            <span className="mx-1 text-gray-300">•</span> Price: $
                            {price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Line Total
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shipment timeline */}
            <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-blue-50 flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Shipment Timeline
                </h2>
              </div>

              {sortedEvents && sortedEvents.length > 0 ? (
                <div className="px-5 py-4 space-y-4">
                  {sortedEvents.map((evt, idx) => {
                    const label = normalizeStatus(evt.status || '');
                    const isLast = idx === sortedEvents.length - 1;
                    const isFirst = idx === 0;

                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              isLast
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {isLast ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock3 className="h-3 w-3" />
                            )}
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-blue-100 mt-1" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {evt.timestamp
                              ? formatDate(evt.timestamp)
                              : evt.date
                              ? formatDate(evt.date)
                              : '—'}
                          </p>
                          {evt.note && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {evt.note}
                            </p>
                          )}
                          {isFirst && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              Order created
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-6 text-sm text-gray-500">
                  No shipment events recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Right column: customer + payment */}
          <div className="space-y-6">
            {/* Customer / shipping */}
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Customer & Shipping
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Customer
                  </p>
                  <p className="font-medium text-gray-900">
                    {order.customerName ||
                      order.customerDetails?.name ||
                      '—'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.email ||
                      order.customerDetails?.email ||
                      'No email'}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-900">
                      {shippingAddress.line1 || '—'}
                      {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
                    </p>
                    <p className="text-sm text-gray-900">
                      {[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {shippingAddress.country || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Estimated delivery:{' '}
                    <span className="font-medium text-gray-800">
                      {formatDate(order.estimatedDelivery)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="rounded-2xl border border-emerald-100 bg-white/95 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Payment & Totals
                </h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    ${shipping?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    ${tax?.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-emerald-100 pt-3 mt-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      Total
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    ${total?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Payment status:{' '}
                  <span className="font-medium text-gray-800">
                    {order.paymentStatus || 'Unknown'}
                  </span>
                </p>
                {order.stripePaymentIntentId && (
                  <p className="truncate">
                    Payment Intent:{' '}
                    <span className="font-mono">
                      {order.stripePaymentIntentId}
                    </span>
                  </p>
                )}
                {order.stripeSessionId && (
                  <p className="truncate">
                    Session ID:{' '}
                    <span className="font-mono">
                      {order.stripeSessionId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
