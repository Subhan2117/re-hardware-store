'use client';
import { ShoppingCart } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { Settings } from 'lucide-react';
import { FolderTree } from 'lucide-react';
import { Package } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <aside className="w-64 bg-white border-r border-orange-200 shadow-lg">
      <div className="p-6 border-b border-orange-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Hardware Store
        </h1>
        <p className="text-xs text-gray-600 mt-1">Admin Dashboard</p>
      </div>
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-orange-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
