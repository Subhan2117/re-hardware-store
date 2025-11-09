"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/api/firebase/firebase";

// Helper to normalize order item shapes
function extractItemsFromOrder(data) {
  // Common shapes:
  // { items: [{ productId, quantity }, ...] }
  // { productId, quantity } (single-item orders - used in mock data)
  const items = [];
  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach((it) => {
      if (!it) return;
      const id = it.productId ?? it.id ?? it.product ?? it.sku;
      const qty = Number(it.quantity ?? it.qty ?? 1) || 0;
      if (id) items.push({ productId: String(id), quantity: qty });
    });
    return items;
  }

  if (data.productId) {
    items.push({ productId: String(data.productId), quantity: Number(data.quantity ?? data.qty ?? 1) || 0 });
    return items;
  }

  return items;
}

export default function useTopProducts({ limit = 4, lookbackTimestamp = null } = {}) {
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Fetch orders (optionally apply lookback filter)
        const ordersCol = collection(db, "orders");
        const ordersQuery = lookbackTimestamp
          ? query(ordersCol, where("createdAt", ">=", lookbackTimestamp))
          : ordersCol;

        const ordersSnap = await getDocs(ordersQuery);

        // Aggregate sold quantities by productId
        const soldMap = new Map();
        ordersSnap.forEach((d) => {
          const data = d.data() || {};
          const items = extractItemsFromOrder(data);
          if (items.length === 0) {
            // fallback: if order contains productId at top-level in mock data
            // already handled by extractItemsFromOrder
          }
          items.forEach((it) => {
            const pid = String(it.productId);
            const prev = soldMap.get(pid) ?? 0;
            soldMap.set(pid, prev + Number(it.quantity || 0));
          });
        });

        // Fetch all products to resolve names and current stock
        const productsCol = collection(db, "products");
        const prodSnap = await getDocs(productsCol);
        const prodMap = new Map();
        prodSnap.forEach((d) => {
          const pdata = d.data() || {};
          prodMap.set(d.id, { id: d.id, name: pdata.name ?? pdata.title ?? pdata.sku ?? d.id, stock: Number(pdata.stock ?? 0) });
        });

        // Build array of aggregated products
        const rows = [];
        soldMap.forEach((sold, pid) => {
          const prod = prodMap.get(pid);
          const name = prod?.name ?? `Product ${pid}`;
          const remaining = prod?.stock ?? 0;
          const total = sold + remaining;
          rows.push({ id: pid, name, sold, total });
        });

        // If no orders found, optionally show some products with zero sold
        if (rows.length === 0) {
          // fallback: show top products by stock
          prodSnap.forEach((d) => {
            const pdata = d.data() || {};
            rows.push({ id: d.id, name: pdata.name ?? d.id, sold: 0, total: Number(pdata.stock ?? 0) });
          });
        }

        rows.sort((a, b) => b.sold - a.sold);
        const result = rows.slice(0, limit);

        if (alive) setTopProducts(result);
      } catch (err) {
        console.error("useTopProducts failed:", err);
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [limit, lookbackTimestamp]);

  return { topProducts, loading, error };
}
