'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase/firebase';

const DEFAULT_ACTIVE = { count: 1847, newVisitors: 892, returning: 955, deltaPct: 18.2 };

export default function ActiveCustomers({ data = null }) {
  const [metrics, setMetrics] = useState(data || DEFAULT_ACTIVE);

  useEffect(() => {
    // if parent passed data, don't fetch
    if (data) return;

    const fetchMetrics = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));

        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
        const endYesterday = new Date(startToday.getTime() - 1);

        const activeWindowMs = 24 * 60 * 60 * 1000; // last 24 hours
        const activeSince = new Date(now.getTime() - activeWindowMs);

        const customersToday = new Set();
        const customersYesterday = new Set();
        const firstOrderTimestamps = {}; // customerId -> earliest order date

        snap.forEach((doc) => {
          const o = doc.data();
          // identify customer by id/email/name fallback
          const cid = o.customerId || o.customer?.id || o.customer?.email || o.customerName || o.customer?.name || doc.id;
          const created = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)) : null;
          if (!created) return;

          // todays active set (last 24h)
          if (created >= activeSince) customersToday.add(cid);

          // yesterday active set
          if (created >= startYesterday && created <= endYesterday) customersYesterday.add(cid);

          if (!firstOrderTimestamps[cid] || created < firstOrderTimestamps[cid]) {
            firstOrderTimestamps[cid] = created;
          }
        });

        const activeCount = customersToday.size;

        // new visitors: customers whose first order is within active window
        let newVisitors = 0;
        customersToday.forEach((cid) => {
          const first = firstOrderTimestamps[cid];
          if (first && first >= activeSince) newVisitors += 1;
        });

        const returning = activeCount - newVisitors;

        // delta vs yesterday active count (percent)
        const yesterdayCount = customersYesterday.size || 1; // avoid div by zero
        const deltaPct = Math.round(((activeCount - yesterdayCount) / yesterdayCount) * 100 * 10) / 10;

        setMetrics({ count: activeCount, newVisitors, returning, deltaPct });
      } catch (err) {
        console.error('Error computing active customers metrics', err);
      }
    };

    fetchMetrics();
  }, [data]);

  const { count, newVisitors, returning, deltaPct } = metrics;

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
        <div className="text-4xl font-bold text-gray-900 mb-4">{(count || 0).toLocaleString()}</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">New visitors</span>
            <span className="font-semibold text-gray-900">{(newVisitors || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Returning customers</span>
            <span className="font-semibold text-gray-900">{(returning || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-3">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-semibold">{deltaPct >= 0 ? `+${deltaPct}` : deltaPct}%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
