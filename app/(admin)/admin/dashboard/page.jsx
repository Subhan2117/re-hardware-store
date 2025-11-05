// app/admin/page.jsx (SERVER)

import StatCards from '@/app/component/admin-comps/StatCard';
import SalesOverview from '@/app/component/admin-comps/SalesOverview';
import RecentOrders from '@/app/component/admin-comps/RecentOrders';
import CategoryDistribution from '@/app/component/admin-comps/CategoryDistribution';
import TopProducts from '@/app/component/admin-comps/TopProducts';
import ActiveCustomers from '@/app/component/admin-comps/ActiveCustomer';
import GrowthCard from '@/app/component/admin-comps/GrowthCard';
export default function AdminPage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      
      {/* Use CSS variable for desktop padding; falls back to 16rem */}
      <main className="flex-1 transition ease-in-out duration-300">
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
  );
}
