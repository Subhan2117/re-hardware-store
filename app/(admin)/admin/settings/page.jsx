'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { db } from '@/api/firebase/firebase';
{/* Settings */}
export default function Page() {
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [contactName, setContactName] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search for:', username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Admin settings</p>
        </div>

        {/* Admin Settings Card */}
        <div className="max-w-6xl bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Admin Info</h1>
            <p className=" text-sm text-gray-500">Change your personal information here</p>
          
          <label className="block text-sm font-medium text-gray-600 mb-1">Admin username</label>
          {/* Input for Admin Name */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </form>

          {/* Admin Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Admin Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contact Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Save Button */}
          <button className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
            Save Settings
          </button>

        </div>

      </div>
    </div>
  );
}
