// app/admin/page.jsx
'use client';

import StatCards from '@/app/component/admin-comps/StatCards';
import SalesOverview from '@/app/component/admin-comps/SalesOverview';
import RecentOrders from '@/app/component/admin-comps/RecentOrders';
import CategoryDistribution from '@/app/component/admin-comps/CategoryDistribution';
import TopProducts from '@/app/component/admin-comps/TopProducts';
import ActiveCustomers from '@/app/component/admin-comps/ActiveCustomer';
import GrowthCard from '@/app/component/admin-comps/GrowthCard';
import { useAdminDashboardData } from '@/app/hooks/useAdminDashboardData';

export default function AdminPage() {
  const { loading, error, stats, pcts, salesByMonth } = useAdminDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <main className="flex-1 transition ease-in-out duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats now driven by shared hook */}
          <StatCards stats={stats} pcts={pcts} loading={loading} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SalesOverview
              salesData={salesByMonth}
              loading={loading}
              error={error}
            />
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
  );
}
