'use client';
import { useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/api/firebase/firebase';

export default function useProducts({
  pageSize = 10,
  search = '',
  category = 'all',
  stock = 'all',
}) {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // for next/previous pagination
  const [page, setPage] = useState(1);
  const cursorsRef = useRef([]);

  //reset pagination whenever filters/search/pagesize change

  useEffect(() => {
    setPage(1);
    setLastDoc(null);
    cursorsRef.current = [];
  }, [category, stock, search, pageSize]);

  const buildBaseQuery = (startDoc = null) => {
    const col = collection(db, 'products');

    // normalize inputs
    const normCategory = (category ?? 'all').trim();
    const normStock = stock ?? 'all';

    // stock thresholds aligned with UI:
    // in-stock: > 10, low-stock: 1..10, out-of-stock: 0
    const hasStockRange = normStock === 'in-stock' || normStock === 'low-stock';

    // IMPORTANT: when using range filters, first orderBy must be on that field
    let q = hasStockRange
      ? query(col, orderBy('stock'), orderBy('name'), limit(pageSize))
      : query(col, orderBy('name'), limit(pageSize));

    // category equality filter
    if (normCategory !== 'all') {
      q = query(q, where('category', '==', normCategory));
    }

    // stock filters
    if (normStock === 'in-stock') {
      q = query(q, where('stock', '>', 10));
    } else if (normStock === 'low-stock') {
      q = query(q, where('stock', '>', 0), where('stock', '<=', 10));
    } else if (normStock === 'out-of-stock') {
      q = query(q, where('stock', '==', 0));
      // equality doesn’t require orderBy on same field; using orderBy('name') is fine
    }

    if (startDoc) q = query(q, startAfter(startDoc));
    return q;
  };

  const fetchPage = async (startDoc = null) => {
    setLoading(true);
    try {
      const q = buildBaseQuery(startDoc);
      const snap = await getDocs(q);
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // local search (simple contains) — note this searches within the fetched page
      const term = (search || '').toLowerCase().trim();
      if (term) {
        rows = rows.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term)
        );
      }

      setProducts(rows);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);

      cursorsRef.current[page] = startDoc || null;
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDoc = page === 1 ? null : cursorsRef.current[page];
    fetchPage(startDoc);
  }, [page, category, stock, search, pageSize]);

  const loadNextPage = async () => {
    if (!lastDoc) return;
    cursorsRef.current[page + 1] = lastDoc;
    setPage((p) => p + 1);
  };

  const loadPrevPage = async () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  };

  return { products, loading, page, loadNextPage, loadPrevPage };
}
