// app/(protected)/admin/components/StatCards.jsx
'use client';

import {
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Package,
  FolderTree,
} from 'lucide-react';

const DEFAULT_STATS = {
  revenue: 42350,
  orders: 1234,
  products: 249,
  categories: 12,
};

function StatCard({ title, value, icon: Icon, accentClass, subtext, loading }) {
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
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        )}
        {!loading && subtext && (
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <ArrowUpRight className="w-4 h-4" />
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

const formatPct = (n) =>
  n === null || n === undefined ? '0%' : `${n >= 0 ? '+' : ''}${n}%`;

export default function StatCards({
  stats = DEFAULT_STATS,
  pcts = { revenue: 0, orders: 0, products: 0 },
  loading = false,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`$${(stats.revenue || 0).toLocaleString()}`}
        icon={DollarSign}
        accentClass="bg-gradient-to-br from-orange-400 to-amber-500"
        loading={loading}
        subtext={
          <>
            <span className="font-semibold">{formatPct(pcts.revenue)}</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </>
        }
      />
      <StatCard
        title="Total Orders"
        value={stats.orders || 0}
        icon={ShoppingCart}
        accentClass="bg-gradient-to-br from-blue-400 to-blue-600"
        loading={loading}
        subtext={
          <>
            <span className="font-semibold">{formatPct(pcts.orders)}</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </>
        }
      />
      <StatCard
        title="Total Products"
        value={stats.products || 0}
        icon={Package}
        accentClass="bg-gradient-to-br from-purple-400 to-purple-600"
        loading={loading}
        subtext={
          <>
            <span className="font-semibold">{formatPct(pcts.products)}</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </>
        }
      />
      <StatCard
        title="Categories"
        value={stats.categories || 0}
        icon={FolderTree}
        accentClass="bg-gradient-to-br from-green-400 to-green-600"
        loading={loading}
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
