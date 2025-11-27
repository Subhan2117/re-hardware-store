'use client';
import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/api/firebase/firebase';

const DEFAULT_ORDERS = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    product: 'Cordless Drill',
    amount: 99.99,
    status: 'completed',
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    product: 'Circular Saw',
    amount: 149.99,
    status: 'processing',
  },
  {
    id: '#ORD-003',
    customer: 'Bob Johnson',
    product: 'Hammer Set',
    amount: 29.99,
    status: 'pending',
  },
  {
    id: '#ORD-004',
    customer: 'Alice Brown',
    product: 'Paint Roller',
    amount: 14.99,
    status: 'completed',
  },
  {
    id: '#ORD-005',
    customer: 'Charlie Wilson',
    product: 'Wrench Set',
    amount: 39.99,
    status: 'shipped',
  },
];

function badgeClasses(status) {
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'processing') return 'bg-blue-100 text-blue-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'shipped') return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-700';
}

export default function RecentOrders({ orders: initialOrders = null }) {
  // default to empty and always try to fetch live recent orders when no prop is provided
  const [orders, setOrders] = useState(initialOrders ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders);
      return; // parent provided orders
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch all orders (same source as admin Orders page), then pick the 5 most recent
        const snap = await getDocs(collection(db, 'orders'));
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

        // Helper to read a timestamp-like field safely
        const tsValue = (o) => {
          // prefer createdAt (Firestore Timestamp)
          if (o.createdAt && typeof o.createdAt.toDate === 'function') return o.createdAt.toDate().getTime();
          // fallback to lastUpdate strings
          if (o.lastUpdate) return new Date(o.lastUpdate).getTime();
          // fallback to 0
          return 0;
        };

        // sort by most-recent (createdAt or lastUpdate)
        list.sort((a, b) => tsValue(b) - tsValue(a));

        const top5 = list.slice(0, 5).map((data) => ({
          id: data.orderNumber || data.trackingNumber || `#${data.id?.slice?.(0, 6) || ''}`,
          customer: data.customerName || data.customer?.name || data.customerEmail || data.email || 'Customer',
          amount: data.total || data.amount || 0,
          status: data.status || 'processing',
        }));

        setOrders(top5);
      } catch (err) {
        console.error('Error fetching recent orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [initialOrders]);

  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-lg">
      <div className="p-5 border-b border-orange-100 flex items-center justify-between">
        <div>
          <div className="text-gray-900 font-semibold">Recent Orders</div>
          <div className="text-gray-600 text-sm">Latest customer orders</div>
        </div>
        <button className="p-2 rounded-lg hover:bg-orange-50">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 space-y-3">
        {loading && (
          <div className="text-sm text-gray-600">Loading recent orders...</div>
        )}

        {!loading && orders.length > 0 &&
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all border border-orange-100 overflow-hidden"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate" title={order.id}>{order.id}</div>
                <div className="text-xs text-gray-600 truncate" title={order.customer}>{order.customer}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${order.amount}</div>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${badgeClasses(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}

        {!loading && orders.length === 0 && (
          <div className="text-sm text-gray-600">No recent orders.</div>
        )}
      </div>
    </div>
  );
}
