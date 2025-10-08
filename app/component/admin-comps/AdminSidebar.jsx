'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, BarChart3, Settings,
  X, Bookmark, Menu,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products',  label: 'Products',  icon: Package         },
  { id: 'orders',    label: 'Orders',    icon: ShoppingCart    },
  { id: 'categories',label: 'Categories',icon: FolderTree      },
  { id: 'analytics', label: 'Analytics', icon: BarChart3       },
  { id: 'settings',  label: 'Settings',  icon: Settings        },
];

export default function AdminSidebar() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(false);       // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop slim

  // Restore collapsed state, then set CSS var
  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    const isCollapsed = saved === '1';
    setCollapsed(isCollapsed);
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '16rem');
  }, []);

  // Persist and update CSS var on change
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', collapsed ? '1' : '0');
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '5rem' : '16rem');
  }, [collapsed]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const desktopWidth = collapsed ? 'w-20' : 'w-64';

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
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'}
                  gap-3 px-3 py-2 rounded-lg transition-all
                  ${active
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-orange-50'}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
