"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, orderBy, query as fsQuery } from "firebase/firestore";
import { db } from "@/app/api/firebase/firebase";
import Link from "next/link";

export default function Page({ params }) {
	// Next.js may pass `params` as a Promise to client components.
	// Unwrap it using React.use() as recommended by Next.js migration messages.
	const resolvedParams = React.use(params) ?? {};
	const id = resolvedParams?.products;
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [product, setProduct] = useState({
		name: "",
		price: 0,
		stock: 0,
		category: "",
		sku: "",
		image: "",
		description: "",
	});

	const [categories, setCategories] = useState([]);

	useEffect(() => {
		if (!id) return;
		let alive = true;

		(async () => {
			try {
				const ref = doc(db, "products", id);
				const snap = await getDoc(ref);
				if (!snap.exists()) {
					window.alert("Product not found");
					router.push("/admin/products");
					return;
				}
				const data = snap.data() || {};
				if (alive) setProduct({ id: snap.id, ...data });
			} catch (err) {
				console.error("Failed to load product", err);
				window.alert("Failed to load product. See console for details.");
			} finally {
				if (alive) setLoading(false);
			}
		})();

		// load categories for dropdown (optional)
		(async () => {
			try {
				const q = fsQuery(collection(db, "categories"), orderBy("name"));
				const snap = await getDocs(q);
				if (alive) {
					setCategories(
						snap.docs.map((d) => ({ label: d.data()?.name ?? d.id, value: (d.data()?.name ?? d.id).trim() }))
					);
				}
			} catch (e) {
				console.warn("Failed to load categories", e);
			}
		})();

		return () => {
			alive = false;
		};
	}, [id, router]);

	async function handleSave(e) {
		e.preventDefault();
		setSaving(true);
		try {
			const ref = doc(db, "products", id);
			const payload = {
				name: (product.name || "").trim(),
				price: Number(product.price) || 0,
				stock: Number(product.stock) || 0,
				category: product.category || "",
				sku: product.sku || "",
				image: product.image || "",
				description: product.description || "",
			};
			await updateDoc(ref, payload);
			window.alert("Product updated");
			router.push("/admin/products");
		} catch (err) {
			console.error("Failed to save product", err);
			window.alert("Failed to save product. See console for details.");
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-600">Loading product…</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6">
			<div className="max-w-3xl mx-auto bg-white rounded-2xl border border-orange-100 shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold">Edit Product</h2>
					<Link href="/admin/products" className="text-sm text-gray-600 hover:underline">
						Back to products
					</Link>
				</div>

				<form onSubmit={handleSave} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Name</label>
						<input
							value={product.name}
							onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Price</label>
							<input
								type="number"
								step="0.01"
								value={product.price}
								onChange={(e) => setProduct((p) => ({ ...p, price: e.target.value }))}
								className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Stock</label>
							<input
								type="number"
								value={product.stock}
								onChange={(e) => setProduct((p) => ({ ...p, stock: e.target.value }))}
								className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Category</label>
						{categories.length > 0 ? (
							<select
								value={product.category}
								onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
								className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
							>
								<option value="">Select category</option>
								{categories.map((c) => (
									<option key={c.value} value={c.value}>
										{c.label}
									</option>
								))}
							</select>
						) : (
							<input
								value={product.category}
								onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
								className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
							/>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">SKU</label>
						<input
							value={product.sku}
							onChange={(e) => setProduct((p) => ({ ...p, sku: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Image URL</label>
						<input
							value={product.image}
							onChange={(e) => setProduct((p) => ({ ...p, image: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Description</label>
						<textarea
							value={product.description}
							onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 text-sm"
							rows={4}
						/>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Link href="/admin/products" className="text-sm text-gray-600 hover:underline">
							Cancel
						</Link>
						<button
							type="submit"
							disabled={saving}
							className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl px-4 py-2 text-sm"
						>
							{saving ? "Saving…" : "Save changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}