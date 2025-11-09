// app/settings/page.jsx

import { Hammer, ShoppingCart } from 'lucide-react';
import SettingsTabs from './settingsTab.jsx';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50/30">
      {/* Navbar */}

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 text-balance">
              Account Settings
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Manage your profile, addresses, and preferences
            </p>
          </div>

          {/* Client-side settings tabs */}
          <SettingsTabs />
        </div>
      </div>
    </div>
  );
}
