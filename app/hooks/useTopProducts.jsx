"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/api/firebase/firebase";

// Helper to normalize order item shapes
function extractItemsFromOrder(data) {
  const items = [];

  // 1️⃣ Primary source in YOUR schema: products[]
  // products: [{ productId: "2", quantity: 3 }, ...]
  if (Array.isArray(data.products) && data.products.length > 0) {
    const namesFromItems =
      Array.isArray(data.items) && data.items.length === data.products.length
        ? data.items
        : null;

    data.products.forEach((p, idx) => {
      if (!p) return;
      const productId = p.productId ?? p.id ?? p.sku ?? p.product;
      const qty = Number(p.quantity ?? p.qty ?? 1) || 0;
      if (!productId || qty <= 0) return;

      // try to get a name from items[index] if it exists
      const orderName =
        namesFromItems && namesFromItems[idx]?.name
          ? namesFromItems[idx].name
          : undefined;

      items.push({
        productId: String(productId),
        quantity: qty,
        name: orderName,
      });
    });

    if (items.length > 0) return items;
  }

  // 2️⃣ Fallback: generic items[] used in mock / other shapes
  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach((it) => {
      if (!it) return;
      const id =
        it.productId ??
        it.id ??
        it.product ??
        it.sku ??
        null;
      const qty = Number(it.quantity ?? it.qty ?? 1) || 0;
      if (!id || qty <= 0) return;

      items.push({
        productId: String(id),
        quantity: qty,
        name: it.name,
      });
    });
    if (items.length > 0) return items;
  }

  // 3️⃣ Fallback: single-item order with top-level fields
  if (data.productId || data.product || data.sku) {
    const id = data.productId ?? data.product ?? data.sku;
    const qty = Number(data.quantity ?? data.qty ?? 1) || 0;
    if (id && qty > 0) {
      items.push({
        productId: String(id),
        quantity: qty,
        name: data.name,
      });
    }
  }

  return items;
}

export default function useTopProducts({
  limit = 4,
  lookbackTimestamp = null,
} = {}) {
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Fetch orders (optional lookback by createdAt)
        const ordersCol = collection(db, "orders");
        const ordersQuery = lookbackTimestamp
          ? query(ordersCol, where("createdAt", ">=", lookbackTimestamp))
          : ordersCol;

        const ordersSnap = await getDocs(ordersQuery);

        // Map: productId -> { sold, nameFromOrder? }
        const soldMap = new Map();

        ordersSnap.forEach((d) => {
          const data = d.data() || {};
          const items = extractItemsFromOrder(data);

          items.forEach((it) => {
            const pid = String(it.productId);
            const prev = soldMap.get(pid) ?? { sold: 0, nameFromOrder: it.name };
            soldMap.set(pid, {
              sold: prev.sold + Number(it.quantity || 0),
              // keep first non-empty name we see
              nameFromOrder: prev.nameFromOrder || it.name,
            });
          });
        });

        // 2. Fetch all products to resolve names + stock
        const productsCol = collection(db, "products");
        const prodSnap = await getDocs(productsCol);
        const prodMap = new Map();
        prodSnap.forEach((d) => {
          const pdata = d.data() || {};
          prodMap.set(d.id, {
            id: d.id,
            name: pdata.name ?? pdata.title ?? pdata.sku ?? d.id,
            stock: Number(pdata.stock ?? 0),
          });
        });

        const rows = [];

        // 3. Build from actual sales
        soldMap.forEach((value, pid) => {
          const { sold, nameFromOrder } = value;
          const prod = prodMap.get(pid);
          const name = prod?.name ?? nameFromOrder ?? `Product ${pid}`;
          const remaining = prod?.stock ?? 0;
          const total = sold + remaining;
          rows.push({ id: pid, name, sold, total });
        });

        // 4. If no sales yet, fallback to product list with stock
        if (rows.length === 0) {
          prodSnap.forEach((d) => {
            const pdata = d.data() || {};
            rows.push({
              id: d.id,
              name: pdata.name ?? pdata.title ?? pdata.sku ?? d.id,
              sold: 0,
              total: Number(pdata.stock ?? 0),
            });
          });
        }

        // sort desc by sold and apply limit
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
