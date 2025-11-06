'use client';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/api/firebase/firebase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Package, Plus, X } from 'lucide-react';
import { db } from '@/app/api/firebase/firebase';
// add to your imports
import {
  collection,
  getDocs,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export default function AddProductPage() {
  const [form, setForm] = useState({
    id: '', // optional custom Firestore doc id (string)
    sku: '',
    name: '',
    category: '',

    description: '',
    longDescription: '',
    price: '',
    rating: '',
    stock: '',
    inStock: true,
    image: '', // primary image url
    features: [''],
    specifications: [{ key: '', value: '' }],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [images, setImages] = useState([]); // local previews only
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState({ type: '', msg: '' });
  // add near other useState hooks
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [categories, setCategories] = useState([]); // [{label, value}]

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // ---- dynamic arrays/maps ----
  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, ''] }));
  const setFeature = (i, v) =>
    setForm((f) => {
      const next = [...f.features];
      next[i] = v;
      return { ...f, features: next };
    });
  const removeFeature = (i) =>
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, idx) => idx !== i),
    }));

  const addSpec = () =>
    setForm((f) => ({
      ...f,
      specifications: [...f.specifications, { key: '', value: '' }],
    }));
  const setSpec = (i, field, v) =>
    setForm((f) => {
      const next = [...f.specifications];
      next[i] = { ...next[i], [field]: v };
      return { ...f, specifications: next };
    });
  const removeSpec = (i) =>
    setForm((f) => ({
      ...f,
      specifications: f.specifications.filter((_, idx) => idx !== i),
    }));

  // ---- images (preview only) ----

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // keep real files for upload
    setImageFiles((prev) => [...prev, ...files]);

    // keep local previews for UI only
    const previews = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...previews]);
  };

  const removePreview = (i) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i]); // <-- revoke
      return prev.filter((_, idx) => idx !== i);
    });
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  // cleanup on unmount
  useEffect(() => {
    return () => images.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  // ---- validation + transform ----
  function validateAndBuildPayload() {
    const errors = [];

    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim(); // IMPORTANT: must match your products.category values (e.g., "Hand Tools")

    const description = form.description.trim();
    const longDescription = form.longDescription.trim();
    const image = form.image.trim();

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0)
      errors.push('Price must be a non-negative number.');

    const rating = form.rating === '' ? null : parseFloat(form.rating);
    if (rating !== null && (isNaN(rating) || rating < 0 || rating > 5)) {
      errors.push('Rating must be between 0 and 5.');
    }

    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0)
      errors.push('Stock must be a non-negative integer.');

    if (!name) errors.push('Product Name is required.');
    if (!sku) errors.push('SKU is required.');
    if (!category) errors.push('Category is required.');
    if (!description) errors.push('Description is required.');

    const features = (form.features || [])
      .map((s) => (s ?? '').trim())
      .filter(Boolean);

    const specifications = {};
    (form.specifications || []).forEach((row) => {
      const k = (row.key ?? '').trim();
      if (k) specifications[k] = row.value ?? '';
    });

    if (errors.length) return { ok: false, errors };

    // Build Firestore document
    const docBody = {
      sku,
      name,
      category, // e.g., "Hand Tools"

      description,
      longDescription,
      price,
      rating: rating === null ? 0 : rating,
      stock,
      inStock: Boolean(form.inStock),
      image,
      images: [],
      features, // array<string>
      specifications, // map
      createdAt: serverTimestamp?.(),
    };

    // Optional: store 'id' inside doc body too
    if (form.id.trim()) docBody.id = String(form.id).trim();

    return { ok: true, data: docBody };
  }

  async function uploadAllProductImages(productId, files) {
    const urls = await Promise.all(
      files.map(async (file) => {
        const key = `products/${productId}/${Date.now()}-${file.name}`;
        const fileRef = sRef(storage, key);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
      })
    );
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner({ type: '', msg: '' });

    const check = validateAndBuildPayload();
    if (!check.ok) {
      setBanner({ type: 'error', msg: check.errors[0] });
      return;
    }

    setSubmitting(true);
    try {
      const productsCol = collection(db, 'products');
      let productRef;

      if (form.id.trim()) {
        productRef = doc(productsCol, String(form.id).trim());
        await setDoc(productRef, check.data, { merge: true });
      } else {
        productRef = await addDoc(productsCol, check.data);
      }

      // Upload images (if any), then update Firestore with their URLs
      if (imageFiles.length) {
        const downloadURLs = await uploadAllProductImages(
          productRef.id,
          imageFiles
        );

        // if no primary provided, use the first uploaded
        const primary = check.data.image?.trim()
          ? check.data.image.trim()
          : downloadURLs[0];

        await updateDoc(productRef, {
          images: downloadURLs,
          image: primary,
          updatedAt: serverTimestamp?.(),
        });
      }

      setBanner({ type: 'success', msg: 'Product added successfully.' });

      // Reset (keep some UX niceties like status default)
      setForm({
        id: '',
        sku: '',
        name: '',
        category: '',
        description: '',
        longDescription: '',
        price: '',
        rating: '',
        stock: '',
        inStock: true,
        image: '',
        features: [''],
        specifications: [{ key: '', value: '' }],
      });
      setImages([]);
      setImageFiles([]);
    } catch (err) {
      console.error('Add product failed:', err);
      setBanner({
        type: 'error',
        msg: 'Failed to add product. Check console for details.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatLoading(true);
        setCatError('');
        // categories docs have: name: "Hand Tools", filter: "hand-tools"
        // We want products.category to match EXACTLY what's in products (Title Case),
        // so we use `name` as the option value.
        const q = fsQuery(collection(db, 'categories'), orderBy('name'));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            label: data.name ?? d.id, // shown in dropdown
            value: data.name ?? d.id, // stored to form.category (must match products.category)
          };
        });
        if (alive) setCategories(rows);
      } catch (e) {
        console.error('Load categories failed:', e);
        if (alive) setCatError('Failed to load categories');
        if (alive) setCategories([]);
      } finally {
        if (alive) setCatLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/products" className="inline-flex">
            <button className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-gray-700 hover:bg-amber-50 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-600">
              Fill in the details to add a new product to inventory
            </p>
          </div>
        </div>

        {/* Banner */}
        {banner.msg && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              banner.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {banner.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="e.g., Heavy Duty Hammer"
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none ring-0 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={onChange}
                  placeholder="e.g., HND-002"
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                >
                  <option value="">
                    {catLoading ? 'Loading…' : 'Select category'}
                  </option>

                  {catError && <option disabled>{catError}</option>}

                  {!catLoading &&
                    !catError &&
                    categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Enter product description..."
                required
                rows={5}
                className="w-full rounded-lg border border-amber-200 bg-amber-50/30 px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
              />
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={onChange}
                    placeholder="0.00"
                    required
                    className="w-full rounded-lg border border-amber-200 bg-white px-7 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={onChange}
                  placeholder="0"
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Rating
                </label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={onChange}
                  placeholder="4.9"
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-7">
                <input
                  id="inStock"
                  type="checkbox"
                  name="inStock"
                  checked={form.inStock}
                  onChange={onChange}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="inStock"
                  className="text-sm font-medium text-gray-800"
                >
                  In Stock
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Primary Image URL
                </label>
                <input
                  name="image"
                  value={form.image}
                  onChange={onChange}
                  placeholder="/hammer.jpg or https://…"
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </section>

          {/* Detailed Description */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Detailed Description
            </h2>
            <textarea
              name="longDescription"
              value={form.longDescription}
              onChange={onChange}
              rows={6}
              placeholder="Full paragraph about the product…"
              className="w-full rounded-lg border border-amber-200 bg-amber-50/30 px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
            />
          </section>

          {/* Features */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Features</h2>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-amber-700 hover:bg-amber-200"
              >
                <Plus className="h-4 w-4" /> Add Feature
              </button>
            </div>

            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={f}
                    onChange={(e) => setFeature(i, e.target.value)}
                    placeholder={`Feature #${i + 1}`}
                    className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="rounded-lg bg-gray-200 px-3 py-2 hover:bg-gray-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Specifications */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Specifications
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-amber-700 hover:bg-amber-200"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
            </div>

            <div className="space-y-2">
              {form.specifications.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <input
                    value={row.key}
                    onChange={(e) => setSpec(i, 'key', e.target.value)}
                    placeholder="Key (e.g., Handle Material)"
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400 md:col-span-2"
                  />
                  <input
                    value={row.value}
                    onChange={(e) => setSpec(i, 'value', e.target.value)}
                    placeholder="Value (e.g., Fiberglass)"
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-amber-400 md:col-span-3"
                  />
                  <div className="md:col-span-5">
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="mt-1 rounded-lg bg-gray-200 px-3 py-2 hover:bg-gray-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Product Images (Dropzone style) */}
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_6px_24px_rgba(251,146,60,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Product Images
            </h2>
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/20 p-8 text-center">
              <input
                id="uploader"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleImageUpload(e);
                  e.currentTarget.value = ''; // <-- lets user pick the same file(s) again
                }}
              />

              <label htmlFor="uploader" className="block cursor-pointer">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <p className="mt-3 font-medium text-gray-900">
                  Click to upload images
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.map((src, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={src}
                      className="h-32 w-full rounded-lg border border-amber-200 object-cover"
                      alt={`Preview ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/products">
              <button
                type="button"
                className="rounded-lg border border-amber-200 bg-white px-5 py-2 text-gray-700 hover:bg-amber-50"
                disabled={submitting}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 font-medium text-white shadow-md ${
                submitting
                  ? 'bg-orange-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90'
              }`}
            >
              <Package className="h-4 w-4" />
              {submitting ? 'Adding…' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
