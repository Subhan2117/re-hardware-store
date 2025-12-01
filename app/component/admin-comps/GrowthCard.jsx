'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';

const DEFAULT_GROWTH = { growth: 0, revenue: 0, customers: 0, products: 0 };

// Generic pct change helper
function pctChange(prev, curr) {
  if (prev === 0) {
    if (curr === 0) return 0;
    return 100; // previous 0, current > 0 → 100% growth
  }
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// Try to read order amount robustly
function extractOrderAmount(data) {
  let amount =
    data?.total ??
    data?.orderTotal ??
    data?.amount ??
    data?.grandTotal ??
    0;

  if (typeof amount === 'string') {
    amount = parseFloat(amount) || 0;
  }

  // If stored in cents, normalize (very defensive)
  if (amount > 100000) {
    amount = amount / 100;
  }

  return Number.isFinite(amount) ? amount : 0;
}

export default function GrowthCard() {
  const [loading, setLoading] = useState(true);
  const [growthStats, setGrowthStats] = useState(DEFAULT_GROWTH);

  useEffect(() => {
    let mounted = true;

    async function fetchMoM() {
      setLoading(true);
      try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Firestore timestamps for queries
        const currentMonthStartTS = Timestamp.fromDate(currentMonthStart);
        const nextMonthStartTS = Timestamp.fromDate(nextMonthStart);
        const prevMonthStartTS = Timestamp.fromDate(prevMonthStart);

        // -------- ORDERS: revenue + customers MoM (from Firestore) --------
        const ordersRef = collection(db, 'orders');
        const qCurrOrders = query(
          ordersRef,
          where('createdAt', '>=', currentMonthStartTS),
          where('createdAt', '<', nextMonthStartTS)
        );
        const qPrevOrders = query(
          ordersRef,
          where('createdAt', '>=', prevMonthStartTS),
          where('createdAt', '<', currentMonthStartTS)
        );

        const [currOrdersSnap, prevOrdersSnap] = await Promise.all([
          getDocs(qCurrOrders),
          getDocs(qPrevOrders),
        ]);

        // Revenue from orders
        let currRevenue = 0;
        currOrdersSnap.forEach((d) => {
          currRevenue += extractOrderAmount(d.data());
        });

        let prevRevenue = 0;
        prevOrdersSnap.forEach((d) => {
          prevRevenue += extractOrderAmount(d.data());
        });

        // Customers (unique)
        const currCustomers = new Set();
        currOrdersSnap.forEach((d) => {
          const data = d.data();
          const cust =
            data?.customer?.email ??
            data?.customer?.id ??
            data?.customerName ??
            data?.customer?.name;
          if (cust) currCustomers.add(cust);
        });

        const prevCustomers = new Set();
        prevOrdersSnap.forEach((d) => {
          const data = d.data();
          const cust =
            data?.customer?.email ??
            data?.customer?.id ??
            data?.customerName ??
            data?.customer?.name;
          if (cust) prevCustomers.add(cust);
        });

        // -------- PRODUCTS: catalog size MoM --------
        const productsRef = collection(db, 'products');
        const qPrevTotal = query(
          productsRef,
          where('createdAt', '<', currentMonthStartTS)
        );
        const qCurrTotal = query(
          productsRef,
          where('createdAt', '<', nextMonthStartTS)
        );

        const [prevTotalSnap, currTotalSnap] = await Promise.all([
          getDocs(qPrevTotal),
          getDocs(qCurrTotal),
        ]);

        const prevTotal = prevTotalSnap.size;
        const currTotal = currTotalSnap.size;

        // -------- Percent changes --------
        const revenuePct = Math.round(pctChange(prevRevenue, currRevenue) * 10) / 10;
        const customersPct =
          Math.round(pctChange(prevCustomers.size, currCustomers.size) * 10) / 10;
        const productsPct =
          Math.round(pctChange(prevTotal, currTotal) * 10) / 10;

        // Overall growth: average of available metrics
        const metrics = [revenuePct, customersPct, productsPct].filter(
          (n) => typeof n === 'number' && !Number.isNaN(n)
        );
        const overall = metrics.length
          ? Math.round(
              (metrics.reduce((a, b) => a + b, 0) / metrics.length) * 10
            ) / 10
          : 0;

        if (mounted) {
          setGrowthStats({
            growth: overall,
            revenue: revenuePct,
            customers: customersPct,
            products: productsPct,
          });
        }
      } catch (err) {
        console.error('Failed to compute growth from Firestore', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMoM();
    return () => {
      mounted = false;
    };
  }, []);

  const { growth, revenue, customers, products } = growthStats;

  return (
    <div className="rounded-xl shadow-xl text-white bg-gradient-to-br from-orange-500 to-amber-500">
      <div className="p-5 border-b border-white/20 flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Growth Rate</div>
          <div className="text-orange-100 text-sm">
            Month-over-month performance
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="p-5">
        <div className="text-5xl font-bold mb-4">
          {loading ? '…' : `${growth >= 0 ? '+' : ''}${growth}%`}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Revenue growth</span>
            <span className="font-semibold">
              {loading ? '…' : `${revenue >= 0 ? '+' : ''}${revenue}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Customer growth</span>
            <span className="font-semibold">
              {loading ? '…' : `${customers >= 0 ? '+' : ''}${customers}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Product expansion</span>
            <span className="font-semibold">
              {loading ? '…' : `${products >= 0 ? '+' : ''}${products}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
