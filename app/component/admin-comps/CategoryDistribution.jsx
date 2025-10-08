'use client';

const DEFAULT_CATEGORIES = [
  { name: 'Power Tools', value: 35 },
  { name: 'Hand Tools', value: 25 },
  { name: 'Paint & Supplies', value: 20 },
  { name: 'Hardware', value: 20 },
];

// round helper to eliminate engine float drift
const round = (n, p = 3) => Number(n.toFixed(p));
const toRad = (deg) => (deg * Math.PI) / 180;

export default function CategoryDistribution({ data = DEFAULT_CATEGORIES }) {
  const fills = ['#f97316', '#3b82f6', '#a855f7', '#10b981'];

  const radius = 40;
  const cx = 50;
  const cy = 50;

  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg">
      <div className="p-5 border-b border-orange-100">
        <div className="text-gray-900 font-semibold">Category Distribution</div>
        <div className="text-gray-600 text-sm">Sales by category</div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.reduce((acc, category, index) => {
                const prevTotal = data.slice(0, index).reduce((s, c) => s + c.value, 0);
                const startAngle = (prevTotal / 100) * 360;
                const endAngle = ((prevTotal + category.value) / 100) * 360;
                const largeArc = category.value > 50 ? 1 : 0;

                const [sx, sy] = [
                  round(cx + radius * Math.cos(toRad(startAngle))),
                  round(cy + radius * Math.sin(toRad(startAngle))),
                ];
                const [ex, ey] = [
                  round(cx + radius * Math.cos(toRad(endAngle))),
                  round(cy + radius * Math.sin(toRad(endAngle))),
                ];

                acc.push(
                  <path
                    key={index}
                    d={`M ${cx} ${cy} L ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} Z`}
                    style={{ fill: fills[index % fills.length] }}
                  />
                );
                return acc;
              }, [])}
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: fills[index % fills.length] }}
                />
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{category.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
