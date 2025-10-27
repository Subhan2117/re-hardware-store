import OrdersTableClient from './OrdersTableClient';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/api/firebase/firebase';

export default async function OrdersPage() {
  const snapshot = await getDocs(collection(db, 'orders'));
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return <OrdersTableClient orders={orders} />;
}
