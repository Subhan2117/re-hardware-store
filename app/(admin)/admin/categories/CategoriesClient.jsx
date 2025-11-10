'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {
  Wrench,
  Hammer,
  Plug,
  ShowerHead,
  Lightbulb,
  Paintbrush,
  Thermometer,
  Cog,
  Lock,
  Ruler,
  Scissors,
  Zap,
  Search,
  Trash2, // ✅ added for delete button icon
} from 'lucide-react';
import NewCategoryModal from '@/app/component/admin-comps/NewCategory';
import { useRouter } from 'next/navigation';

const categoryIcons = {
  'Power Tools': <Wrench className="h-5 w-5" />,
  'Hand Tools': <Hammer className="h-5 w-5" />,
  Electrical: <Plug className="h-5 w-5" />,
  Plumbing: <ShowerHead className="h-5 w-5" />,
  Lighting: <Lightbulb className="h-5 w-5" />,
  'Paint & Supplies': <Paintbrush className="h-5 w-5" />,
  HVAC: <Thermometer className="h-5 w-5" />,
  Hardware: <Cog className="h-5 w-5" />,
  Security: <Lock className="h-5 w-5" />,
  'Measuring Tools': <Ruler className="h-5 w-5" />,
  'Cutting Tools': <Scissors className="h-5 w-5" />,
  Generators: <Zap className="h-5 w-5" />,
};

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const categoryData = catSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const prodSnap = await getDocs(collection(db, 'products'));
        const productData = prodSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategories(categoryData);
        setProducts(productData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const count = products.filter((p) => p.category === cat.name).length;
      return {
        ...cat,
        count,
        icon: categoryIcons[cat.name] || <Cog className="h-5 w-5" />,
      };
    });
  }, [categories, products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categoriesWithCounts;
    return categoriesWithCounts.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoriesWithCounts, query]);

  const handleDelete = async (id) => {
    const docSnap = doc(db, "categories", id);
    await deleteDoc(docSnap);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appliance Categories
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and manage all hardware store appliance categories
            </p>
          </div>

          <div className="relative w-full sm:w-[26rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-9 w-full h-10 border border-gray-400 bg-gray-100 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-gray-600 outline-none placeholder:text-gray-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            onClick={() => setShowNewCat(true)}
          >
            + Add Category
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              // ✅ removed router.push to make it non-clickable
              className="relative rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="p-5 flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500">{cat.count} items</p>
                  </div>
                </div>

                {/* ✅ static delete button */}
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-gray-400 hover:text-red-600 transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!filtered.length && (
          <div className="mt-20 text-center text-gray-500">
            No categories match “{query}”.
          </div>
        )}

        {showNewCat && (
          <NewCategoryModal onClose={() => setShowNewCat(false)} />
        )}
      </div>
    </div>
  );
}
