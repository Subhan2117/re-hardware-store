'use client';

import { useMemo, useState } from 'react';

const DEFAULT_SALES = [
  { month: 'Jan', sales: 4200 },
  { month: 'Feb', sales: 3800 },
  { month: 'Mar', sales: 5100 },
  { month: 'Apr', sales: 4600 },
  { month: 'May', sales: 6200 },
  { month: 'Jun', sales: 7800 },
];

const round = (n, p = 3) => Number(n.toFixed(p));
const toRad = (deg) => (deg * Math.PI) / 180;
const fmtCurrency = (n) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

/** Create nice y-axis ticks (0..max rounded up) */
function makeTicks(max) {
  if (max <= 0 || !isFinite(max)) return [0, 1];
  // round max to a "nice" step: 1k / 2k / 2.5k / 5k etc.
  const pow10 = Math.pow(10, Math.floor(Math.log10(max)));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * pow10);
  const niceMax = candidates.find((c) => c >= max) ?? candidates[candidates.length - 1];
  const steps = 4; // 5 ticks including zero
  const step = niceMax / steps;
  return Array.from({ length: steps + 1 }, (_, i) => Math.round(i * step));
}

export default function SalesOverview({ data = DEFAULT_SALES }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const { maxSales, ticks, points, linePath, bars, months } = useMemo(() => {
    const months = data.map((d) => d.month);
    const maxSales = Math.max(...data.map((d) => d.sales), 1);
    const ticks = makeTicks(maxSales);

    // normalized coordinates (0..100) for SVG
    const xs = data.map((_, i) => (i / (data.length - 1)) * 100);
    const ys = data.map((d) => 100 - (d.sales / ticks[ticks.length - 1]) * 100);

    // Polyline points (rounded to avoid SSR float drift)
    const points = xs.map((x, i) => `${round(x)},${round(ys[i])}`);

    // Smooth-ish path using simple quadratic beziers (optional):
    // For simplicity/robustness we’ll stick to polyline; path shown as comment if you want later.
    const linePath = null;

    // bars: height % relative to tick max (not raw max), for alignment with axis
    const bars = data.map((d) => (d.sales / ticks[ticks.length - 1]) * 100);

    return { maxSales, ticks, points, linePath, bars, months };
  }, [data]);

  // layout constants
  const axisWidthPx = 56; // left gutter for y-axis
  const chartHeightPx = 256; // h-64
  const barGapPx = 12;

  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg">
      <div className="p-5 border-b border-orange-100">
        <div className="text-gray-900 font-semibold">Sales Overview</div>
        <div className="text-gray-600 text-sm">Monthly sales performance</div>
      </div>

      <div className="p-5">
        <div className="relative w-full" style={{ height: chartHeightPx }}>
          {/* Y-axis (left) */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-between pr-2"
               style={{ width: axisWidthPx }}>
            {ticks
              .slice()
              .reverse()
              .map((t, i) => (
                <div key={i} className="relative h-0">
                  <div className="absolute -translate-y-1/2 right-0 text-xs text-gray-500 tabular-nums">
                    {fmtCurrency(t)}
                  </div>
                </div>
              ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 left-[56px] right-0">
            <div className="absolute inset-0 flex flex-col justify-between">
              {ticks.map((_, i) => (
                <div key={i} className="w-full border-t border-gray-100" />
              ))}
            </div>
          </div>

          {/* Bars (behind), offset by axis width */}
          <div
            className="absolute inset-x-0 bottom-6 flex items-end"
            style={{ left: axisWidthPx, gap: barGapPx, right: 0 }}
          >
            {bars.map((pct, i) => (
              <div key={i} className="flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-md shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ height: `${pct}%` }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                />
              </div>
            ))}
          </div>

          {/* Line overlay (SVG) */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-0 w-[calc(100%-56px)] h-[calc(100%-24px)]"
            style={{ left: axisWidthPx }} // respect axis gutter
          >
            {/* optional area fill under line */}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Fill area */}
            <polygon
              fill="url(#areaGrad)"
              opacity="0.15"
              points={`0,100 ${points.join(' ')} 100,100`}
            />

            {/* Line */}
            <polyline
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              points={points.join(' ')}
            />

            {/* Dots + hover targets */}
            {points.map((pt, i) => {
              const [x, y] = pt.split(',').map(Number);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="1.4" fill="#f97316" stroke="#fff" strokeWidth="0.4" />
                  {/* Larger invisible hover area for easier interaction */}
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* X-axis labels (months) */}
          <div className="absolute bottom-0 left-[56px] right-0 flex justify-between text-xs text-gray-500">
            {months.map((m) => (
              <span key={m} className="px-1">{m}</span>
            ))}
          </div>

          {/* Tooltip */}
          {hoverIdx !== null && (
            <Tooltip
              idx={hoverIdx}
              axisWidth={axisWidthPx}
              chartHeight={chartHeightPx}
              months={months}
              data={data}
              ticks={ticks}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Tooltip component (positioned above the hovered point) */
function Tooltip({ idx, axisWidth, chartHeight, months, data, ticks }) {
  const max = ticks[ticks.length - 1] || 1;
  const xPct = (idx / (data.length - 1)) * 100;
  const yPct = 100 - (data[idx].sales / max) * 100;

  // Convert to pixels relative to chart container
  const left = axisWidth + (xPct / 100) * (typeof window !== 'undefined' ? (document?.querySelector?.('svg')?.clientWidth ?? 0) : 0);
  // But relying on DOM here would be brittle; better to place using percentage transforms:
  // We'll position the container using percentages to avoid layout reads.

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `calc(${axisWidth}px + ${xPct}%)`,
        bottom: `calc(${100 - yPct}% + 28px)`, // lift tooltip above point
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
        <span className="font-semibold">{months[idx]}: </span>
        <span>{fmtCurrency(data[idx].sales)}</span>
      </div>
      <div className="mx-auto h-2 w-2 rotate-45 bg-gray-900 -mt-1" />
    </div>
  );
}
