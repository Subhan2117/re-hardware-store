"use client";
import useTopProducts from '@/app/hooks/useTopProducts.jsx';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Cordless Drill', sold: 234, total: 300 },
  { id: 2, name: 'Circular Saw', sold: 189, total: 250 },
  { id: 3, name: 'Hammer Set', sold: 156, total: 200 },
  { id: 4, name: 'Paint Roller', sold: 142, total: 180 },
];

export default function TopProducts({ products = null, limit = 4 }) {
  const { topProducts, loading } = useTopProducts({ limit });
  const rows = products ?? (loading ? DEFAULT_PRODUCTS : topProducts ?? DEFAULT_PRODUCTS);

  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg">
      <div className="p-5 border-b border-orange-100">
        <div className="text-gray-900 font-semibold">Top Products</div>
        <div className="text-gray-600 text-sm">Best selling items</div>
      </div>

      <div className="p-5 space-y-6">
        {rows.map((p) => {
          const pct = p.total > 0 ? (p.sold / p.total) * 100 : 0;
          return (
            <div key={p.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                <span className="text-sm font-bold text-gray-900">{p.sold}/{p.total}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{p.sold} sold</span>
                <span>{Math.max(0, p.total - p.sold)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
