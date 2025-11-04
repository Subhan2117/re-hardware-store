'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ArrowUpRight, ShoppingCart, Package, FolderTree } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase/firebase';


const DEFAULT_STATS = { revenue: 42350, orders: 1234, products: 249, categories: 12 };

function StatCard({ title, value, icon: Icon, accentClass, subtext }) {
  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className="p-5 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className={`w-10 h-10 rounded-full ${accentClass} flex items-center justify-center`}>
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

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        // Orders: count and sum revenue
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let revenue = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          const value = data?.total ?? data?.amount ?? 0;
          // ensure numeric
          const num = typeof value === 'number' ? value : parseFloat(value) || 0;
          revenue += num;
        });

        const ordersCount = ordersSnap.size;

        // Products: count and unique categories
        const productsSnap = await getDocs(collection(db, 'products'));
        const productsCount = productsSnap.size;
        const categories = new Set();
        productsSnap.forEach((doc) => {
          const data = doc.data();
          const cat = data?.category ?? data?.categories ?? null;
          if (!cat) return;
          if (Array.isArray(cat)) {
            cat.forEach((c) => c && categories.add(c));
          } else {
            categories.add(cat);
          }
        });

        const categoriesCount = categories.size || initialStats.categories;

        if (mounted) {
          setStats({
            revenue: Math.round(revenue),
            orders: ordersCount,
            products: productsCount,
            categories: categoriesCount,
          });
        }
      } catch (err) {
        // keep defaults on error
        // console.error('Failed to fetch stats', err);
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon={DollarSign}
        accentClass="bg-gradient-to-br from-orange-400 to-amber-500"
        subtext={<><span className="font-semibold">+12.5%</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Orders"
        value={stats.orders.toLocaleString()}
        icon={ShoppingCart}
        accentClass="bg-gradient-to-br from-blue-400 to-blue-600"
        subtext={<><span className="font-semibold">+8.2%</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Products"
        value={stats.products}
        icon={Package}
        accentClass="bg-gradient-to-br from-purple-400 to-purple-600"
        subtext={<><span className="font-semibold">+3.1%</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Categories"
        value={stats.categories}
        icon={FolderTree}
        accentClass="bg-gradient-to-br from-green-400 to-green-600"
        subtext={<><span className="font-semibold text-gray-700">Active</span><span className="text-gray-500 ml-1">categories</span></>}
      />
    </div>
  );
}
