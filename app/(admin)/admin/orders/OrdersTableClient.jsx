//client component 

'use client';
import { useState, useMemo } from 'react';

export default function OrdersTableClient({ orders }) {
  const [filter, setFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    if (filter === 'priority') return orders.filter(o => o.status === 'In Transit');
    if (filter === 'recent') return [...orders].sort((a,b)=>new Date(b.lastUpdate)-new Date(a.lastUpdate));
    return orders;
  }, [orders, filter]);

  // render filteredOrders
}
