"use client"
import React, { useState } from "react";
import Navbar from "@/app/component/Navbar";
import { Search } from "lucide-react";

export default function page() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="py-10 min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 relative px-4">
      <Navbar/>

      {/* Header */}
      <div className="mt-20 text-center">
        <header className="relative z-10 py-16">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg tracking-wide">
            Track Your Order
          </h1>
          <p className="mt-7 text-lg font-semibold text-gray-800">
            Enter your tracking number below to see the current status and location of your order
          </p>
        </header>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-center mt-8">
        <div className="relative w-full max-w-xl">
          {/* Icon inside the input */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

          <input
            type="text"
            value={trackingNumber}
            onChange={() => setTrackingNumber(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? "" : "Enter tracking number"}
            className="w-full h-15 pl-12 pr-28 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 placeholder-gray-400 shadow-lg"
          />

          {/* Track Order button on the far right */}
          {!trackingNumber && !focused && (
            <button
                type="button" 
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2 rounded-lg">
                Track Order
                </button>
          )}
        </div>
      </div>
    </div>
  );
}
