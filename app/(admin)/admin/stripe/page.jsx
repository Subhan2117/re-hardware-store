"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/api/firebase/firebase";
import { format } from "date-fns";

function safeFormatOrderDate(o) {
  try {
    if (o?.createdAt && typeof o.createdAt.toDate === 'function') {
      const dt = o.createdAt.toDate();
      if (!isNaN(dt.getTime())) return format(dt, 'yyyy-MM-dd');
    }
    if (o?.createdAt) {
      const dt = new Date(o.createdAt);
      if (!isNaN(dt.getTime())) return format(dt, 'yyyy-MM-dd');
    }
    if (o?.lastUpdate) {
      const dt = new Date(o.lastUpdate);
      if (!isNaN(dt.getTime())) return format(dt, 'yyyy-MM-dd');
    }
  } catch (err) {
    // fallthrough
  }
  return '';
}

function sumRevenue(orders) {
  return orders.reduce((s, o) => s + (Number(o.total ?? o.amount ?? 0) || 0), 0);
}

function groupByPeriod(orders, period = "day") {
  const map = new Map();
  orders.forEach((o) => {
    // prefer createdAt timestamp if available
    let d = null;
    if (o.createdAt && typeof o.createdAt.toDate === "function") d = o.createdAt.toDate();
    else if (o.createdAt) d = new Date(o.createdAt);
    else if (o.lastUpdate) d = new Date(o.lastUpdate);
    else d = new Date();

    // ensure we have a valid Date object
    if (!(d instanceof Date)) d = new Date(d);
    if (isNaN(d.getTime())) {
      // skip entries with invalid dates to avoid "Invalid time value" errors
      // (could also fallback to now or log as needed)
      console.warn('Skipping order with invalid date', o && o.id);
      return;
    }

    let key;
    if (period === "month") key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  else key = format(d, "yyyy-MM-dd");

    const prev = map.get(key) || 0;
    map.set(key, prev + (Number(o.total ?? o.amount ?? 0) || 0));
  });
  // return sorted array (most recent first)
  return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function StripeDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeTotal, setStripeTotal] = useState(null);
  const [stripeRevenueByPeriod, setStripeRevenueByPeriod] = useState([]);
  const [productFilter, setProductFilter] = useState("all");
  const [period, setPeriod] = useState("day");

  useEffect(() => {
    let alive = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [pSnap, oSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
        ]);

        const prods = pSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        const ords = oSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

        if (!alive) return;
        setProducts(prods);
        setOrders(ords);
      } catch (err) {
        console.error("Failed to load stripe dashboard data", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    // fetch Stripe revenue summary
    async function fetchStripeRevenue() {
      setStripeLoading(true);
      try {
        const res = await fetch(`/api/admin/stripe/revenue?period=${period}&days=90`);
        if (res.ok) {
          const j = await res.json();
          if (alive) {
            setStripeTotal(typeof j.totalRevenue === 'number' ? j.totalRevenue : null);
            setStripeRevenueByPeriod(j.revenueByPeriod || []);
          }
        } else {
          // server not configured or error
          console.warn('Stripe revenue API returned non-ok', res.status);
        }
      } catch (err) {
        console.warn('Failed to fetch Stripe revenue', err);
      } finally {
        if (alive) setStripeLoading(false);
      }
    }

    fetchData();
    fetchStripeRevenue();
    return () => { alive = false; };
  }, []);

  const filteredOrders = useMemo(() => {
    if (productFilter === "all") return orders;
    return orders.filter((o) => {
      const items = o.products || o.items || o.line_items || [];
      // items may be array of { productId } or product ids
      return items.some((it) => {
        if (!it) return false;
        if (typeof it === "string") return it === productFilter;
        return (it.productId === productFilter) || (it.id === productFilter) || (it.product === productFilter);
      });
    });
  }, [orders, productFilter]);

  const totalRevenue = useMemo(() => {
    // prefer Stripe totals when available
    if (stripeTotal != null) return stripeTotal;
    return sumRevenue(filteredOrders);
  }, [filteredOrders, stripeTotal]);

  const revenueByPeriod = useMemo(() => {
    if (stripeRevenueByPeriod && stripeRevenueByPeriod.length) return stripeRevenueByPeriod;
    return groupByPeriod(filteredOrders, period);
  }, [filteredOrders, stripeRevenueByPeriod, period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payments & Reports</h1>
            <p className="text-sm text-gray-600">Revenue, reports and analytics (sourced from Firestore orders)</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="px-3 py-2 border rounded">
              <option value="all">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.title ?? p.id}</option>
              ))}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded">
              <option value="day">By day</option>
              <option value="month">By month</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">Total revenue</div>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow md:col-span-2">
            <div className="text-sm text-gray-500 mb-2">Revenue ({period === 'day' ? 'daily' : 'monthly'})</div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {loading && <div className="text-sm text-gray-600">Loading Firestore...</div>}
              {stripeLoading && <div className="text-sm text-gray-600">Loading Stripe data...</div>}
              {!loading && !stripeLoading && revenueByPeriod.length === 0 && <div className="text-sm text-gray-600">No revenue data.</div>}
              {!loading && !stripeLoading && revenueByPeriod.map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">{period === 'day' ? key : `${key}`}</div>
                  <div className="font-semibold">${Number(val).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Payments (latest)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Products</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 50).map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{o.trackingNumber || o.orderNumber || o.id}</td>
                    <td className="px-3 py-2">{o.customerName || o.customer?.name || o.customerEmail || ''}</td>
                    <td className="px-3 py-2">${Number(o.total ?? o.amount ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {(o.products || o.items || []).map((it, i) => (
                        <div key={i} className="text-xs">{(it.name || it.title || it.productName) ?? it.productId ?? it.id ?? JSON.stringify(it)}</div>
                      ))}
                    </td>
                    <td className="px-3 py-2">{safeFormatOrderDate(o)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
