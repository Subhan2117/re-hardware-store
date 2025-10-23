import React from 'react';
import { Search } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="gap-4">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Static Order Page</p>
          </div>
        </div>
<div className='flex justify-between items-center'>
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
        <div className="flex gap-6 ">
          <button className="px-2 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Filter Recent
          </button>

          <button className="px-2 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Filter Priority
          </button>
        </div>
      </div>
        </div>
      {/* Orders Table (static, no interactivity) */}
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">ORDER #</td>
              <td className="px-6 py-4 text-gray-700">customer 1</td>
              <td className="px-6 py-4 text-gray-700">2025-10-20</td>
              <td className="px-6 py-4 text-gray-700">$299.99</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Delivered
                </span>
              </td>
            </tr>

            <tr className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">ORD-1002</td>
              <td className="px-6 py-4 text-gray-700">customer 2</td>
              <td className="px-6 py-4 text-gray-700">2025-10-19</td>
              <td className="px-6 py-4 text-gray-700">$149.50</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Processing
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      


      </div>
    </div>
  );
}
