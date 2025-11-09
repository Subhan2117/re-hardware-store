'use client';

import {
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Package,
  FolderTree,
} from 'lucide-react';
import { db } from '@/app/api/firebase/firebase';
import { collection, count, getAggregateFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDocs, query, where, Timestamp } from 'firebase/firestore';


const DEFAULT_STATS = {
  revenue: 42350,
  orders: 1234,
  products: 249,
  categories: 12,
};

const productsRef = collection(db, 'products');
const productsSnapshot = await getAggregateFromServer(productsRef, {
  countAlias: count(),
});

const ordersRef = collection(db, 'orders');
const ordersSnapshot = await getAggregateFromServer(ordersRef, {
  countAlias: count(),
});

const categoryRef = collection(db, 'categories');
const categorySnap = await getAggregateFromServer(categoryRef, {
  countAlias: count(),
});

function StatCard({ title, value, icon: Icon, accentClass, subtext }) {
  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className="p-5 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div
            className={`w-10 h-10 rounded-full ${accentClass} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {subtext && (
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <ArrowUpRight className="w-4 h-4" />
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatCards({ stats: initialStats = DEFAULT_STATS }) {
  const [stats, setStats] = useState(initialStats);
  const [pcts, setPcts] = useState({ revenue: null, orders: null, products: null });

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        // Lifetime totals (keep existing behavior)
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let revenue = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          const value = data?.total ?? data?.amount ?? 0;
          const num = typeof value === 'number' ? value : parseFloat(value) || 0;
          revenue += num;
        });
        const ordersCount = ordersSnap.size;

        const productsSnap = await getDocs(collection(db, 'products'));
        const productsCount = productsSnap.size;
        const categories = new Set();
        productsSnap.forEach((doc) => {
          const data = doc.data();
          const cat = data?.category ?? data?.categories ?? null;
          if (!cat) return;
          if (Array.isArray(cat)) cat.forEach((c) => c && categories.add(c));
          else categories.add(cat);
        });
        const categoriesCount = categories.size || initialStats.categories;

        // Month boundaries for percentage calculations
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = currentMonthStart;
        const currentMonthStartTS = Timestamp.fromDate(currentMonthStart);
        const nextMonthStartTS = Timestamp.fromDate(nextMonthStart);
        const prevMonthStartTS = Timestamp.fromDate(prevMonthStart);
        const prevMonthEndTS = Timestamp.fromDate(prevMonthEnd);

        // Current and previous month orders (for revenue and orders pct)
        const ordersRef = collection(db, 'orders');
        const qCurrOrders = query(ordersRef, where('createdAt', '>=', currentMonthStartTS), where('createdAt', '<', nextMonthStartTS));
        const qPrevOrders = query(ordersRef, where('createdAt', '>=', prevMonthStartTS), where('createdAt', '<', prevMonthEndTS));
        const [currOrdersSnap, prevOrdersSnap] = await Promise.all([getDocs(qCurrOrders), getDocs(qPrevOrders)]);

        let currRevenue = 0;
        currOrdersSnap.forEach((d) => {
          const data = d.data();
          const v = data?.total ?? data?.amount ?? 0;
          currRevenue += typeof v === 'number' ? v : parseFloat(v) || 0;
        });
        let prevRevenue = 0;
        prevOrdersSnap.forEach((d) => {
          const data = d.data();
          const v = data?.total ?? data?.amount ?? 0;
          prevRevenue += typeof v === 'number' ? v : parseFloat(v) || 0;
        });

        const currOrdersCount = currOrdersSnap.size;
        const prevOrdersCount = prevOrdersSnap.size;

        // Product totals at boundaries for product pct (cumulative totals)
        const productsRef = collection(db, 'products');
        const qPrevTotal = query(productsRef, where('createdAt', '<', currentMonthStartTS));
        const qCurrTotal = query(productsRef, where('createdAt', '<', nextMonthStartTS));
        const [prevTotalSnap, currTotalSnap] = await Promise.all([getDocs(qPrevTotal), getDocs(qCurrTotal)]);
        const prevTotal = prevTotalSnap.size;
        const currTotal = currTotalSnap.size;

        // percent change helper
        const pctChange = (prev, curr) => {
          if (prev === 0) return curr === 0 ? 0 : 100;
          return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10; // one decimal
        };

        const revenuePct = pctChange(prevRevenue, currRevenue);
        const ordersPct = pctChange(prevOrdersCount, currOrdersCount);
        const productsPct = pctChange(prevTotal, currTotal);

        if (mounted) {
          setStats({
            revenue: Math.round(revenue),
            orders: ordersCount,
            products: productsCount,
            categories: categoriesCount,
          });
          setPcts({ revenue: revenuePct, orders: ordersPct, products: productsPct });
        }
      } catch (err) {
        // keep defaults on error
        // console.error('Failed to fetch stats', err);
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, []);

  const formatPct = (n) => (n === null || n === undefined ? '0%' : `${n >= 0 ? '+' : ''}${n}%`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon={DollarSign}
        accentClass="bg-gradient-to-br from-orange-400 to-amber-500"
        subtext={<><span className="font-semibold">{formatPct(pcts.revenue)}</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Orders"
        value={ordersSnapshot.data().countAlias}
        icon={ShoppingCart}
        accentClass="bg-gradient-to-br from-blue-400 to-blue-600"
        subtext={<><span className="font-semibold">{formatPct(pcts.orders)}</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Products"
        value={productsSnapshot.data().countAlias}
        icon={Package}
        accentClass="bg-gradient-to-br from-purple-400 to-purple-600"
        subtext={<><span className="font-semibold">{formatPct(pcts.products)}</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Categories"
        value={categorySnap.data().countAlias}
        icon={FolderTree}
        accentClass="bg-gradient-to-br from-green-400 to-green-600"
        subtext={
          <>
            <span className="font-semibold text-gray-700">Active</span>
            <span className="text-gray-500 ml-1">categories</span>
          </>
        }
      />
    </div>
  );
}
