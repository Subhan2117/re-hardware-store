"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Searchbar({ target = "/store" }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    router.push(
      query ? `${target}?search=${encodeURIComponent(query)}` : target
    );
  };

  return (
    <form onSubmit={onSubmit} className="max-w-6xl mx-auto mb-8">
      <div>
        {/* Search Bar */}
        <div className="flex flex-col sm:items-center sm:flex-row gap-4 p-2 bg-transparent rounded-2xl shadow-2xl border-0">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools, hardware, supplies..."
            className="flex-1 h-14 px-6 bg-white/30 backdrop-blur-lg border border-orange-500 rounded-xl text-lg text-gray-700 md:text-xl py-3 placeholder:text-gray-700 focus:ring-orange-500 focus:outline-none focus:ring-2"
            aria-label="Search"
          />
          <button
            type="submit"
            className="h-12 px-8 text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="mt-5 flex justify-center gap-x-6">
          <Link
            href="/register"
            className="border p-2 rounded-2xl bg-orange-500 shadow-orange-500/50 text-white font-semibold px-4 cursor-pointer"
          >
            Get Started
          </Link>
          <Link
            href={target}
            className="p-2 rounded-2xl backdrop-blur-lg border border-amber-200/30 text-amber-700 bg-amber-50/70 hover:bg-orange-100 transition-all ease-in-out shadow-orange-500/50 font-semibold px-4 cursor-pointer"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </form>
  );
}
