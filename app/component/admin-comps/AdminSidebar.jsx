'use client';

import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, BarChart3, Settings, X, Bookmark,
} from 'lucide-react';
import { useState } from 'react';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  items = SIDEBAR_ITEMS,
  defaultTab = 'dashboard',
  isOpen = false,          // mobile drawer
  onClose = () => {},
  collapsed = false,       // desktop slim mode
  onToggleCollapse = () => {},
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => (document.body.style.overflow = '');
  }, [isOpen]);

  // Widths for desktop
  const desktopWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed z-50 lg:z-20 top-0 left-0 h-full bg-white border-r border-orange-200 shadow-lg
          transition-transform duration-300
          ${desktopWidth}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-hidden={!isOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
      >
        {/* Header */}
        <div className="p-4 border-b border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8" />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold truncate bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Re's-Hardware 
                </h1>
                <p className="text-[11px] text-gray-600">Admin Dashboard</p>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-orange-50"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Bookmark toggle (desktop inside sidebar) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center ml-2 p-2 rounded-md hover:bg-orange-50"
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <Bookmark className="w-4 h-4 text-orange-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {items.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'}
                  gap-3 px-3 py-2 rounded-lg transition-all
                  ${active ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-gray-700 hover:bg-orange-50'}
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
