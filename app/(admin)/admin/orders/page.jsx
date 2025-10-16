import React from 'react';
import { Search } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Static Order Page</p>
          </div>
        </div>

        {/* Search Bar (static, no interactivity) */}
        <div className="mb-4 relative w-full sm:w-[26rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Input customer order ID"
            className="pl-9 w-full h-10 border border-gray-400 bg-gray-100 text-gray-900 rounded-lg text-sm placeholder:text-gray-600"
            disabled
          />
        </div>

        {/* Buttons (static, no onClick) */}
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Filter Recent
          </button>

          <button
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Filter Priority
          </button>
        </div>
      </div>
    </div>
  );
}
