'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/api/firebase/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { Tag, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDealsPage() {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    productId: '',
    name: '',
    description: '',
    originalPrice: '',
    dealPrice: '',
    savingsLabel: '',
    tag: '',
    endsInText: '',
    active: true,
  });

  const [error, setError] = useState('');

  // Load products + deals
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Products
        const productsSnap = await getDocs(collection(db, 'products'));
        const productsData = productsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Deals (order by createdAt desc if exists)
        const dealsRef = collection(db, 'deals');
        const dealsQuery = query(dealsRef, orderBy('createdAt', 'desc'));
        const dealsSnap = await getDocs(dealsQuery);
        const dealsData = dealsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setProducts(productsData);
        setDeals(dealsData);
      } catch (err) {
        console.error('Error loading admin deals:', err);
        setError('Failed to load deals data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({
      productId: '',
      name: '',
      description: '',
      originalPrice: '',
      dealPrice: '',
      savingsLabel: '',
      tag: '',
      endsInText: '',
      active: true,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.productId) {
      setError('Please select a product.');
      return;
    }
    if (!form.dealPrice) {
      setError('Please enter a deal price.');
      return;
    }

    const originalPriceNum = form.originalPrice
      ? parseFloat(form.originalPrice)
      : null;
    const dealPriceNum = parseFloat(form.dealPrice);

    if (Number.isNaN(dealPriceNum)) {
      setError('Deal price must be a valid number.');
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, 'deals'), {
        productId: form.productId,
        name: form.name || null,
        description: form.description || null,
        originalPrice: originalPriceNum,
        dealPrice: dealPriceNum,
        savingsLabel: form.savingsLabel || null,
        tag: form.tag || null,
        endsInText: form.endsInText || null,
        active: form.active,
        createdAt: serverTimestamp(),
      });

      // refetch deals after saving
      const dealsRef = collection(db, 'deals');
      const dealsQuery = query(dealsRef, orderBy('createdAt', 'desc'));
      const dealsSnap = await getDocs(dealsQuery);
      const dealsData = dealsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setDeals(dealsData);

      resetForm();
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (dealId, currentActive) => {
    try {
      await updateDoc(doc(db, 'deals', dealId), {
        active: !currentActive,
      });
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId ? { ...d, active: !currentActive } : d
        )
      );
    } catch (err) {
      console.error('Error updating deal active state:', err);
      alert('Failed to update deal status.');
    }
  };

  const handleDelete = async (dealId) => {
    const confirm = window.confirm('Delete this deal permanently?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'deals', dealId));
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      console.error('Error deleting deal:', err);
      alert('Failed to delete deal.');
    }
  };

  const getProductLabel = (productId) => {
    const p = products.find((p) => p.id === productId);
    if (!p) return productId;
    return p.name || p.title || productId;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-7 h-7 text-amber-600" />
              Deals Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage homepage deals linked to your products.
            </p>
          </div>
        </header>

        {/* New Deal Form */}
        <section className="mb-10">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Add New Deal
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading && products.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading products…
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                {/* Product Select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Product
                  </label>
                  <select
                    name="productId"
                    value={form.productId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.title || 'Unnamed product'} — $
                        {Number(p.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deal Name (optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Pro Contractor Drill Kit"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={form.tag}
                    onChange={handleChange}
                    placeholder="Limited Time, Weekend Deal, Online Exclusive…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short description of the deal…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Original Price (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="249.99"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Deal Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deal Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="dealPrice"
                    value={form.dealPrice}
                    onChange={handleChange}
                    placeholder="189.99"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Savings Label */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Savings Label (optional)
                  </label>
                  <input
                    type="text"
                    name="savingsLabel"
                    value={form.savingsLabel}
                    onChange={handleChange}
                    placeholder="Save 24%"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Ends In Text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ends In Text (optional)
                  </label>
                  <input
                    type="text"
                    name="endsInText"
                    value={form.endsInText}
                    onChange={handleChange}
                    placeholder="Ends in 2 days, Ends Sunday…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="active"
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-slate-700"
                  >
                    Active
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl border text-sm border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow hover:bg-amber-700 disabled:opacity-60"
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Deal
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Existing Deals */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Existing Deals
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading deals…
            </div>
          ) : deals.length === 0 ? (
            <p className="text-sm text-slate-500">
              No deals created yet. Add one above.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {getProductLabel(deal.productId)}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {deal.name || 'Untitled Deal'}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {deal.description || 'No description provided.'}
                  </p>

                  <div className="flex items-baseline gap-2">
                    {typeof deal.dealPrice === 'number' && (
                      <span className="text-base font-semibold text-slate-900">
                        ${deal.dealPrice.toFixed(2)}
                      </span>
                    )}
                    {typeof deal.originalPrice === 'number' && (
                      <span className="text-xs line-through text-slate-400">
                        ${deal.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {deal.tag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-[10px] font-medium text-amber-700 border border-amber-100">
                          {deal.tag}
                        </span>
                      )}
                      {deal.savingsLabel && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                          {deal.savingsLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] mt-1">
                    <span className="text-slate-500">
                      {deal.endsInText || 'No end date text'}
                    </span>
                    <button
                      onClick={() =>
                        handleToggleActive(deal.id, !!deal.active)
                      }
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] ${
                        deal.active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      {deal.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
