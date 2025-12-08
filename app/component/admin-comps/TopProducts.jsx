"use client";

import { TrendingUp, Package } from "lucide-react";
import useTopProducts from "@/app/hooks/useTopProducts.jsx";

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Cordless Drill", sold: 234, total: 300 },
  { id: 2, name: "Circular Saw", sold: 189, total: 250 },
  { id: 3, name: "Hammer Set", sold: 156, total: 200 },
  { id: 4, name: "Paint Roller", sold: 142, total: 180 },
];

export default function TopProducts({
  products = null,
  limit = 4,
  lookbackTimestamp = null,
}) {
  // ✅ call hook here, INSIDE the component body
  const { topProducts, loading, error } = useTopProducts({
    limit,
    lookbackTimestamp,
  });

  const rows =
    products ??
    (loading
      ? DEFAULT_PRODUCTS
      : topProducts && topProducts.length > 0
      ? topProducts
      : DEFAULT_PRODUCTS);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-rose-50/70" />

      <div className="relative flex items-center justify-between border-b border-orange-100/70 px-5 py-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-orange-700 shadow-sm">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Top Products</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Best selling items based on recent orders
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <Package className="h-4 w-4 text-orange-500" />
          <span>
            {loading
              ? "Syncing with orders..."
              : error
              ? "Showing fallback data"
              : "Live from Firestore"}
          </span>
        </div>
      </div>

      <div className="relative space-y-4 px-5 py-5">
        {rows.map((p) => {
          const sold = Number(p.sold ?? 0);
          const total = Number(p.total ?? sold) || sold || 0;
          const pctRaw = total > 0 ? (sold / total) * 100 : 0;
          const pct = Math.max(0, Math.min(100, pctRaw));

          return (
            <div
              key={p.id}
              className="space-y-2 rounded-xl border border-orange-50/80 bg-white/80 px-3 py-3 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="max-w-[60%] truncate text-sm font-semibold text-slate-900">
                  {p.name}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {sold.toLocaleString()} / {total.toLocaleString()}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{sold.toLocaleString()} sold</span>
                <span>
                  {total > sold
                    ? `${(total - sold).toLocaleString()} remaining`
                    : "Sold out"}
                </span>
              </div>
            </div>
          );
        })}

        <div className="pt-1 text-right text-[10px] text-slate-400">
          {loading
            ? "Loading top products..."
            : error
            ? "Could not load from Firestore, using defaults."
            : "Aggregated from orders + products collections."}
        </div>
      </div>
    </div>
  );
}
