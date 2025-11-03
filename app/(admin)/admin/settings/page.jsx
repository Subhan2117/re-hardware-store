"use client"

import React from "react"
import { Mail, Lock, LogOut } from "lucide-react"

export default function Page() {
  const adminName = "John Admin"
  const currentEmail = "admin@hardware.com"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-500">Admin: {adminName}</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Admin Info */}
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Info</h2>
            <div>
              <p className="text-sm text-gray-500">Current Email</p>
              <p className="font-medium">{currentEmail}</p>
            </div>
          </div>

          {/* Change Email (Static Display) */}
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Change Email</h2>
            </div>
            <p className="text-gray-500">
              New email: <span className="font-medium">example@hardware.com</span>
            </p>
            <button
              disabled
              className="mt-3 w-full px-4 py-2 bg-orange-300 text-white rounded-lg cursor-not-allowed font-medium"
            >
              Update Email
            </button>
          </div>

          {/* Change Password (Static Display) */}
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>
            <p className="text-gray-500 mb-3">New password: ••••••••</p>
            <button
              disabled
              className="w-full px-4 py-2 bg-orange-300 text-white rounded-lg cursor-not-allowed font-medium"
            >
              Update Password
            </button>
          </div>

          {/* Logout (Static Display) */}
          <div className="rounded-2xl border border-red-300 bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <LogOut className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-600">Logout</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Sign out of your admin account.
            </p>
            <button
              disabled
              className="w-full px-4 py-2 bg-red-300 text-white rounded-lg cursor-not-allowed font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
