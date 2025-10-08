'use client';
import { ArrowUpRight, Users } from 'lucide-react';

const DEFAULT_ACTIVE = { count: 1847, newVisitors: 892, returning: 955, deltaPct: 18.2 };

export default function ActiveCustomers({ data = DEFAULT_ACTIVE }) {
  const { count, newVisitors, returning, deltaPct } = data;
  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg">
      <div className="p-5 border-b border-orange-100 flex items-center justify-between">
        <div>
          <div className="text-gray-900 font-semibold">Active Customers</div>
          <div className="text-gray-600 text-sm">Currently shopping</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="p-5">
        <div className="text-4xl font-bold text-gray-900 mb-4">{count.toLocaleString()}</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">New visitors</span>
            <span className="font-semibold text-gray-900">{newVisitors.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Returning customers</span>
            <span className="font-semibold text-gray-900">{returning.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-3">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-semibold">+{deltaPct}%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
