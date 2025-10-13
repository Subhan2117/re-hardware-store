// app/admin/layout.jsx
import AdminSidebar from '@/app/component/admin-comps/AdminSidebar.jsx';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar persists across admin routes */}
      <AdminSidebar />
      {/* Keep content offset to the right of the sidebar */}
      <main className="md:pl-[var(--sidebar-width)]">
        {children}
      </main>
    </div>
  );
}
