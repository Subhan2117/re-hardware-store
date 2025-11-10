'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';

const DEFAULT_CATEGORIES = [
  { name: 'Power Tools', value: 35 },
  { name: 'Hand Tools', value: 25 },
  { name: 'Paint & Supplies', value: 20 },
  { name: 'Hardware', value: 20 },
];

// round helper to eliminate engine float drift
const round = (n, p = 3) => Number(n.toFixed(p));
const toRad = (deg) => (deg * Math.PI) / 180;

export default function CategoryDistribution({ data: initialData = null }) {
  const [data, setData] = useState(initialData || DEFAULT_CATEGORIES);
  const fills = ['#f97316', '#3b82f6', '#a855f7', '#10b981'];
  const lightingFill = '#fbbf24'; // yellow for Lighting category

  const radius = 40;
  const cx = 50;
  const cy = 50;

  useEffect(() => {
    // if parent passed data, don't fetch
    if (initialData) return;

    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const counts = {};
        let total = 0;
        snap.forEach((doc) => {
          const product = doc.data();
          const cat = (product.category || 'Uncategorized').replace(
            /[-_]/g,
            ' '
          );
          counts[cat] = (counts[cat] || 0) + 1;
          total += 1;
        });

        if (total === 0) return;

        const computed = Object.entries(counts).map(([name, count]) => ({
          name,
          value: Math.round((count / total) * 100),
        }));

        // ensure we have percentages that sum to 100 (adjust drift)
        const sum = computed.reduce((s, c) => s + c.value, 0);
        if (sum !== 100 && computed.length > 0) {
          const diff = 100 - sum;
          computed[0].value += diff; // apply difference to first bucket
        }

        setData(computed);
      } catch (err) {
        console.error('Error fetching categories for distribution', err);
      }
    };

    fetchCategories();
  }, [initialData]);

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
                const prevTotal = data
                  .slice(0, index)
                  .reduce((s, c) => s + c.value, 0);
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

                const isLighting = String(category.name || '').toLowerCase().trim() === 'lighting';
                const sliceFill = isLighting ? lightingFill : fills[index % fills.length];
                acc.push(
                  <path
                    key={index}
                    d={`M ${cx} ${cy} L ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} Z`}
                    style={{ fill: sliceFill }}
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
                  style={{ background: String(category.name || '').toLowerCase().trim() === 'lighting' ? lightingFill : fills[index % fills.length] }}
                />
                <span className="text-sm font-medium text-gray-900">
                  {category.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {category.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
