// app/component/admin-comps/hooks/useAdminDashboardData.js
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DEFAULT_STATS = {
  revenue: 0,
  orders: 0,
  products: 0,
  categories: 0,
};

function pctChange(prev, curr) {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return Math.round(((curr - prev) / Math.abs(prev)) * 100);
}

function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  if (typeof value === 'string') return new Date(value);
  return null;
}

// Build 6-month series from a revenue map keyed by 'YYYY-MM'
function getLastSixMonthsSalesFromMap(revenueMap) {
  const result = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);

    const year = d.getFullYear();
    const monthNum = d.getMonth() + 1;
    const key = `${year}-${String(monthNum).padStart(2, '0')}`;
    const monthName = d.toLocaleString('default', { month: 'short' });

    result.push({
      month: monthName,
      sales: revenueMap.get(key) || 0,
    });
  }

  return result;
}

// Try to read the order total in a robust way
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

  // If stored in cents (e.g. Stripe style)
  if (amount > 100000) {
    amount = amount / 100;
  }

  return Number.isFinite(amount) ? amount : 0;
}

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [pcts, setPcts] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
  });
  const [salesByMonth, setSalesByMonth] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const ymKey = (d) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const currKey = ymKey(now);
        const prevKey = ymKey(prevMonthStart);

        const ordersRef = collection(db, 'orders');
        const productsRef = collection(db, 'products');

        const [ordersSnap, productsSnap] = await Promise.all([
          getDocs(ordersRef),
          getDocs(productsRef),
        ]);

        // ---------- ORDERS / REVENUE ----------
        let totalRevenue = 0;
        let totalOrders = ordersSnap.size;

        const revenueByMonthMap = new Map(); // 'YYYY-MM' -> revenue
        const ordersByMonthMap = new Map();  // 'YYYY-MM' -> count

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          const createdAt = toDateSafe(data?.createdAt) || new Date();
          const key = ymKey(createdAt);

          const amount = extractOrderAmount(data);
          totalRevenue += amount;

          revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + amount);
          ordersByMonthMap.set(key, (ordersByMonthMap.get(key) || 0) + 1);
        });

        // Curr / prev month revenue
        const currMonthRevenue = revenueByMonthMap.get(currKey) || 0;
        const prevMonthRevenue = revenueByMonthMap.get(prevKey) || 0;

        // Curr / prev month order counts
        const currOrdersCount = ordersByMonthMap.get(currKey) || 0;
        const prevOrdersCount = ordersByMonthMap.get(prevKey) || 0;

        // ---------- PRODUCTS / CATEGORIES ----------
        let productsTotal = productsSnap.size;
        let prevProductsTotal = 0;
        const categoriesSet = new Set();

        productsSnap.forEach((doc) => {
          const data = doc.data();
          const createdAt = toDateSafe(data?.createdAt);

          const cat = data?.category ?? data?.categories ?? null;
          if (cat) {
            if (Array.isArray(cat)) {
              cat.forEach((c) => c && categoriesSet.add(c));
            } else {
              categoriesSet.add(cat);
            }
          }

          // For product % change, count products existing before current month
          if (createdAt && createdAt < currMonthStart) {
            prevProductsTotal++;
          }
        });

        const categoriesCount = categoriesSet.size;

        // ---------- PERCENTAGE CHANGES ----------
        const revenuePct = pctChange(prevMonthRevenue, currMonthRevenue);
        const ordersPct = pctChange(prevOrdersCount, currOrdersCount);
        const productsPct = pctChange(prevProductsTotal, productsTotal);

        // ---------- SALES OVERVIEW SERIES ----------
        const sixMonthSales = getLastSixMonthsSalesFromMap(revenueByMonthMap);

        if (!mounted) return;

        setStats({
          revenue: Math.round(totalRevenue),
          orders: totalOrders,
          products: productsTotal,
          categories: categoriesCount,
        });

        setPcts({
          revenue: revenuePct,
          orders: ordersPct,
          products: productsPct,
        });

        setSalesByMonth(sixMonthSales);
        setLoading(false);
      } catch (err) {
        console.error('[useAdminDashboardData] Firestore-only error:', err);
        if (!mounted) return;
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    loading,
    error,
    stats,
    pcts,
    salesByMonth,
  };
}
