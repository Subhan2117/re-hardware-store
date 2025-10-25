'use client';

import { DollarSign, ArrowUpRight, ShoppingCart, Package, FolderTree } from 'lucide-react';
import { db } from '@/api/firebase/firebase';
import { collection, count, getAggregateFromServer } from 'firebase/firestore';


const DEFAULT_STATS = { revenue: 42350, orders: 1234, products: 249, categories: 12 };

const productsRef = collection(db, "products");
const productsSnapshot = await getAggregateFromServer(productsRef, {
  countAlias: count(),
});

const ordersRef = collection(db, "orders");
const ordersSnapshot = await getAggregateFromServer(ordersRef, {
  countAlias: count(),
});


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
export default function StatCards({ stats = DEFAULT_STATS }) {
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
        value={ordersSnapshot.data().countAlias}
        icon={ShoppingCart}
        accentClass="bg-gradient-to-br from-blue-400 to-blue-600"
        subtext={<><span className="font-semibold">+8.2%</span><span className="text-gray-500 ml-1">vs last month</span></>}
      />
      <StatCard
        title="Total Products"
        value={productsSnapshot.data().countAlias}
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