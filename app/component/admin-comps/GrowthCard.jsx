'use client';
import { TrendingUp } from 'lucide-react';

const DEFAULT_GROWTH = { growth: 24.8, revenue: 12.5, customers: 18.2, products: 3.1 };

export default function GrowthCard({ stats = DEFAULT_GROWTH }) {
  const { growth, revenue, customers, products } = stats;
  return (
    <div className="rounded-xl shadow-xl text-white bg-gradient-to-br from-orange-500 to-amber-500">
      <div className="p-5 border-b border-white/20 flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Growth Rate</div>
          <div className="text-orange-100 text-sm">Overall business growth</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="p-5">
        <div className="text-5xl font-bold mb-4">+{growth}%</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Revenue growth</span>
            <span className="font-semibold">+{revenue}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Customer growth</span>
            <span className="font-semibold">+{customers}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-100">Product expansion</span>
            <span className="font-semibold">+{products}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
