// app/component/admin-comps/hooks/useAdminDashboardData.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DEFAULT_STATS = {
  revenue: 0,
  orders: 0,
  products: 0,
  categories: 0,
};

function pctChange(prev, curr) {
  if (!prev || prev === 0) {
    return curr ? 100 : 0;
  }
  return Math.round(((curr - prev) / Math.abs(prev)) * 100);
}

function toJsDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate(); // Firestore Timestamp
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function ymKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Build 6-month series from a revenue map keyed by 'YYYY-MM'
function getLastSixMonthsSalesFromMap(revenueMap) {
  const result = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);

    const key = ymKeyFromDate(d);
    const monthName = d.toLocaleString('default', { month: 'short' });

    result.push({
      month: monthName,
      sales: revenueMap.get(key) || 0,
    });
  }

  return result;
}

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const ordersRef = collection(db, 'orders');
        const productsRef = collection(db, 'products');

        const [ordersSnap, productsSnap] = await Promise.all([
          getDocs(ordersRef),
          getDocs(productsRef),
        ]);

        // ---------- PRODUCTS ----------
        const productList = productsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            _createdAtNorm: toJsDate(data?.createdAt),
          };
        });

        // Build categories set from products
        const categoriesSet = new Set();
        productList.forEach((p) => {
          const cat = p?.category ?? p?.categories ?? null;
          if (cat) {
            if (Array.isArray(cat)) {
              cat.forEach((c) => c && categoriesSet.add(c));
            } else {
              categoriesSet.add(cat);
            }
          }
        });

        // Index products by id for fast lookup
        const productMap = new Map(
          productList.map((p) => [p.id, p])
        );

        // ---------- ORDERS / REVENUE (match Orders page logic) ----------
        const ordersList = ordersSnap.docs.map((doc) => {
          const data = doc.data();

          const rawProducts = Array.isArray(data.products)
            ? data.products
            : [];

          const productsWithNames = rawProducts.map((p) => {
            const product = productMap.get(p.productId);
            const price = product ? Number(product.price || 0) : 0;

            return {
              ...p,
              name: product ? product.name : `Unknown (${p.productId})`,
              price,
            };
          });

          const total = productsWithNames.reduce(
            (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
            0
          );

          const createdAt = toJsDate(data?.createdAt);
          const updatedAt = toJsDate(data?.updatedAt);
          const orderDate = createdAt || updatedAt || null;

          return {
            id: doc.id,
            ...data,
            products: productsWithNames,
            total,
            orderDate,
          };
        });

        if (!mounted) return;

        setProducts(productList);
        setCategoriesCount(categoriesSet.size);
        setOrders(ordersList);
        setLoading(false);
      } catch (err) {
        console.error('[useAdminDashboardData] Firestore error:', err);
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

  // ---------- CORE STATS ----------
  const stats = useMemo(() => {
    if (!orders.length && !products.length) return DEFAULT_STATS;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      revenue: Math.round(totalRevenue),
      orders: orders.length,
      products: products.length,
      categories: categoriesCount,
    };
  }, [orders, products, categoriesCount]);

  // ---------- PCTS + SALES BY MONTH ----------
  const { pcts, salesByMonth } = useMemo(() => {
    if (!orders.length) {
      return {
        pcts: { revenue: 0, orders: 0, products: 0 },
        salesByMonth: [],
      };
    }

    const now = new Date();
    const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currKey = ymKeyFromDate(now);
    const prevKey = ymKeyFromDate(prevMonthStart);

    const revenueByMonthMap = new Map(); // 'YYYY-MM' -> revenue
    const ordersByMonthMap = new Map();  // 'YYYY-MM' -> count

    orders.forEach((order) => {
      const d = order.orderDate ? toJsDate(order.orderDate) : null;
      if (!d) return;

      const key = ymKeyFromDate(d);
      const total = order.total || 0;

      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + total);
      ordersByMonthMap.set(key, (ordersByMonthMap.get(key) || 0) + 1);
    });

    const currMonthRevenue = revenueByMonthMap.get(currKey) || 0;
    const prevMonthRevenue = revenueByMonthMap.get(prevKey) || 0;

    const currOrdersCount = ordersByMonthMap.get(currKey) || 0;
    const prevOrdersCount = ordersByMonthMap.get(prevKey) || 0;

    // Products % change (based on createdAt before vs total now)
    let prevProductsTotal = 0;
    products.forEach((p) => {
      const created = p._createdAtNorm || toJsDate(p.createdAt);
      if (created && created < currMonthStart) {
        prevProductsTotal++;
      }
    });
    const productsTotal = products.length;

    const revenuePct = pctChange(prevMonthRevenue, currMonthRevenue);
    const ordersPct = pctChange(prevOrdersCount, currOrdersCount);
    const productsPct = pctChange(prevProductsTotal, productsTotal);

    const sixMonthSales = getLastSixMonthsSalesFromMap(revenueByMonthMap);

    return {
      pcts: {
        revenue: revenuePct,
        orders: ordersPct,
        products: productsPct,
      },
      salesByMonth: sixMonthSales,
    };
  }, [orders, products]);

  return {
    loading,
    error,
    stats,
    pcts,
    salesByMonth,
  };
}

export default useAdminDashboardData;
