//app/track/page.jsx
//server component

import Navbar from '@/app/component/Navbar';
import ClientTrackingPage from './ClientTrackingPage';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200">
      

      {/* Header */}
      <div className="mt-20 text-center">
        <header className="relative z-10 py-10">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Track Your Order
          </h1>
          <p className="text-base font-semibold text-gray-800">
            Enter your tracking number to view your order status.
          </p>
        </header>
      </div>

      {/* Client-side file */}
      <ClientTrackingPage />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-300 bg-white/70 backdrop-blur">
        <div className="text-center py-6 text-gray-700 text-sm">
          © 2025 Family Hardware Store • Need help? Call (555) 123-4567
        </div>
      </footer>
    </div>
  );
}
