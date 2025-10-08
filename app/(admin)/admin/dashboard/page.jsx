'use client';
import ActiveCustomers from '@/app/component/admin-comps/ActiveCustomer';
import AdminSidebar from '@/app/component/admin-comps/AdminSidebar';
import CategoryDistribution from '@/app/component/admin-comps/CategoryDistribution';
import GrowthCard from '@/app/component/admin-comps/GrowthCard';
import RecentOrders from '@/app/component/admin-comps/RecentOrders';
import SalesOverview from '@/app/component/admin-comps/SalesOverview';
import StatCards from '@/app/component/admin-comps/StatCard';
import TopProducts from '@/app/component/admin-comps/TopProducts';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop slim

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Top Nav (mobile) */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-orange-100 px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-lg hover:bg-orange-50"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Re's-Hardware — Admin
        </h1>
        <div className="w-5" />
      </header>

      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main */}
        <main
          className={`flex-1 transition-[margin] duration-300 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Desktop bookmark handle (floats at the sidebar edge) */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <StatCards />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SalesOverview />
              <RecentOrders />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CategoryDistribution />
              <TopProducts />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ActiveCustomers />
              <GrowthCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
