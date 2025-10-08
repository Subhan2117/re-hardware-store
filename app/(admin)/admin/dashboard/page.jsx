import ActiveCustomers from "@/app/component/admin-comps/ActiveCustomer";
import AdminSidebar from "@/app/component/admin-comps/AdminSidebar";
import CategoryDistribution from "@/app/component/admin-comps/CategoryDistribution";
import GrowthCard from "@/app/component/admin-comps/GrowthCard";
import RecentOrders from "@/app/component/admin-comps/RecentOrders";
import SalesOverview from "@/app/component/admin-comps/SalesOverview";
import StatCards from "@/app/component/admin-comps/StatCard";
import TopProducts from "@/app/component/admin-comps/TopProducts";


export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <StatCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesOverview />
            <RecentOrders />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryDistribution />
            <TopProducts />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActiveCustomers />
            <GrowthCard />
          </div>
        </div>
      </main>
    </div>
  );
}
