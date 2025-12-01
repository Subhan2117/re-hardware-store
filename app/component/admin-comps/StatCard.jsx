'use client';

import {
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Package,
  FolderTree,
} from 'lucide-react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';


const DEFAULT_STATS = {
  revenue: 42350,
  orders: 1234,
  products: 249,
  categories: 12,
};

// Removed top-level Firestore aggregate calls to avoid running DB reads at module
// evaluation time (this caused permission errors during dev). The component
// now fetches counts inside useEffect and exposes them via state.

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
        // Fetch total revenue from Stripe API
        const revenueResponse = await fetch('/api/admin/stripe/revenue?period=all');
        const revenueData = await revenueResponse.json();
        const totalRevenue = revenueData.totalRevenue || 0;
        
        // Get order count from Firestore
        const ordersSnap = await getDocs(collection(db, 'orders'));
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
        // Calculate date ranges for full months comparison
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        // Convert to Firestore Timestamps
        const currentMonthStartTS = Timestamp.fromDate(currentMonthStart);
        const nextMonthStartTS = Timestamp.fromDate(nextMonthStart);
        const prevMonthStartTS = Timestamp.fromDate(prevMonthStart);
        const prevMonthEndTS = Timestamp.fromDate(prevMonthEnd);
        
        // Get full month data for current and previous months
        const [currentMonthResponse, prevMonthResponse] = await Promise.all([
          fetch(`/api/admin/stripe/revenue?period=month&months=1`),
          fetch(`/api/admin/stripe/revenue?period=month&months=1&endMonth=1`)
        ]);
        
        const currentMonthData = await currentMonthResponse.json();
        const prevMonthData = await prevMonthResponse.json();
        
        // Get the full month revenues
        const currMonthRevenue = currentMonthData.totalRevenue || 0;
        const prevMonthRevenue = prevMonthData.totalRevenue || 0;
        
        console.log('Current month full revenue:', currMonthRevenue);
        console.log('Previous month full revenue:', prevMonthRevenue);
        
        // For the current partial month, get the daily average to project full month
        const currentDayOfMonth = now.getDate();
        const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemainingInMonth = daysInCurrentMonth - currentDayOfMonth;
        
        // Get current month's data up to today
        const currentPartialResponse = await fetch(`/api/admin/stripe/revenue?period=day&days=${currentDayOfMonth}`);
        const currentPartialData = await currentPartialResponse.json();
        const currentPartialRevenue = currentPartialData.totalRevenue || 0;
        
        // Calculate projected full month revenue based on current daily average
        const dailyAverage = currentPartialRevenue / currentDayOfMonth;
        const projectedFullMonthRevenue = dailyAverage * daysInCurrentMonth;
        
        console.log('Current partial revenue:', currentPartialRevenue);
        console.log('Projected full month revenue:', projectedFullMonthRevenue);
        
        // Use the higher of actual or projected for current month
        const currRevenue = Math.max(currMonthRevenue, projectedFullMonthRevenue);
        const prevRevenue = prevMonthRevenue;
        
        console.log('Using current revenue:', currRevenue);
        console.log('Using previous revenue:', prevRevenue);
        
        // Get order counts for percentage calculation
        const ordersRef = collection(db, 'orders');
        const qCurrOrders = query(ordersRef, where('createdAt', '>=', currentMonthStartTS), where('createdAt', '<', nextMonthStartTS));
        const qPrevOrders = query(ordersRef, where('createdAt', '>=', prevMonthStartTS), where('createdAt', '<', prevMonthEndTS));
        const [currOrdersSnap, prevOrdersSnap] = await Promise.all([getDocs(qCurrOrders), getDocs(qPrevOrders)]);

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
          if (prev === 0) return curr === 0 ? 0 : 100; // 100% increase if previous was 0 and current > 0
          const change = ((curr - prev) / Math.abs(prev)) * 100;
          // Round to nearest integer for cleaner display
          return Math.round(change);
        };

        // Debug logs
        console.log('Current month revenue (partial):', currRevenue);
        console.log('Previous month equivalent revenue:', prevRevenue);
        
        const revenuePct = pctChange(prevRevenue, currRevenue);
        console.log('Revenue percentage change:', revenuePct, '%');
        const ordersPct = pctChange(prevOrdersCount, currOrdersCount);
        const productsPct = pctChange(prevTotal, currTotal);

        if (mounted) {
          setStats({
            revenue: Math.round(totalRevenue),
            orders: ordersCount,
            products: productsCount,
            categories: categoriesCount,
          });
          setPcts({ revenue: revenuePct, orders: ordersPct, products: productsPct });
        }
      } catch (err) {
        // keep defaults on error
        console.error('Failed to fetch stats', err);
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
        value={stats.orders}
        icon={ShoppingCart}
        accentClass="bg-gradient-to-br from-blue-400 to-blue-600"
        subtext={<><span className="font-semibold">{formatPct(pcts.orders)}</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Products"
        value={stats.products}
        icon={Package}
        accentClass="bg-gradient-to-br from-purple-400 to-purple-600"
        subtext={<><span className="font-semibold">{formatPct(pcts.products)}</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Categories"
        value={stats.categories}
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
