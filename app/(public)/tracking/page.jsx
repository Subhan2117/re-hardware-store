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
          <p className="mt-5 text-base font-semibold text-gray-800">
            Enter your tracking number below to see the current status and location of your order
          </p>
        </header>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mt-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 border border-gray-200">
          <form 
          className="relative flex items-center">
            {/* Icon */}
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />

            {/* Input */}
            <input
              type="text"
              value={trackingNumber}

              onChange={(e) => setTrackingNumber(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? "" : "Enter tracking number (e.g. HW123456789)"}
              className="w-full h-14 pl-12 pr-32 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

          {/* Track Order button on the far right */}
          {!trackingNumber && !focused && (
            <button
                type="button" 

                className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-700 text-white px-5 py-2 rounded-lg">
                Track Order
                </button>
          )}
          </form>
        </div>
      </div>

    {/* Footer */}
      <footer className="mt-24 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Call us at <span className="text-foreground font-medium">(555) 123-4567</span> or email{" "}
              <span className="text-foreground font-medium">support@familyhardware.com</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
