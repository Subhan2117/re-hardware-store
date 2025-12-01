'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  BarChart3,
  LogOut,
  Users,
  Settings,
  X,
  Bookmark,
  Menu,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/products' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  {
    id: 'categories',
    label: 'Categories',
    icon: FolderTree,
    href: '/admin/categories',
  },

  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/admin/users',
  },
  { id: 'store', label: 'Visit Store', icon: Store, href: '/store' },

  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/user/profile',
  },

  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    href: '/admin/logout',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop slim

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    const isCollapsed = saved === '1';
    setCollapsed(isCollapsed);
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '5rem' : '16rem'
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', collapsed ? '1' : '0');
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '5rem' : '16rem'
    );
  }, [collapsed]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const desktopWidth = collapsed ? 'w-20' : 'w-64';

  // Consider "/admin" as dashboard
  const normalizedPath = pathname === '/admin' ? '/admin/dashboard' : pathname;

  const isActive = (href) =>
    normalizedPath === href || normalizedPath.startsWith(href + '/');

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-orange-100 px-4 py-3 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-lg hover:bg-orange-50"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Re&apos;s-Hardware — Admin
        </h1>
        <div className="w-5" />
      </header>

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed z-50 lg:z-20 top-0 left-0 h-full bg-white border-r border-orange-200 shadow-lg
          transition-transform duration-300
          ${desktopWidth}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8" />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold truncate bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Re&apos;s-Hardware
                </h1>
                <p className="text-[11px] text-gray-600">Admin Dashboard</p>
              </div>
            )}
          </div>

          {/* Close (mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-orange-50"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Collapse (desktop) */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex items-center justify-center ml-2 p-2 rounded-md hover:bg-orange-50"
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <Bookmark className="w-4 h-4 text-orange-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setIsOpen(false)} // close mobile drawer on navigate
                aria-current={active ? 'page' : undefined}
                className={`
                  w-full flex items-center ${
                    collapsed ? 'justify-center' : 'justify-start'
                  }
                  gap-3 px-3 py-2 rounded-lg transition-all
                  ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
