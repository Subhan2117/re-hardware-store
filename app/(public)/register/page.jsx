import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';
import LiquidEther from '../../component/background/LiquidEther'; // keep as-is if this path works
import RegisterClient from './RegisterClient';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden relative px-4">
      {/* Animated background */}
      <div className="absolute inset-0">
        <LiquidEther
          colors={['#F8FAFC', '#FFEDD5', '#FFE0B2']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 mt-15">
        <div className="max-w-7xl mx-auto flex items-center justify-end ">
          <p className="flex flex-col text-xs md:text-sm text-gray-600 text-right">
            Already have an account?
            <Link
              href="/login"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Card */}
      <main className="relative z-10 flex justify-center mt-10">
        <div className="w-full max-w-4xl rounded-2xl shadow-2xl border border-amber-200/40 overflow-hidden bg-white/80 backdrop-blur-lg">
          <div className="grid md:grid-cols-2">
            {/* LEFT: interactive form (client) */}
            <RegisterClient />

            {/* RIGHT: marketing panel */}
            <div className="hidden md:flex p-8 items-center justify-center text-center bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 min-h-[600px]">
              <p className="text-white text-xl font-semibold">
                Welcome to our Hardware Store!
                <br />
                Create an account today and start exploring 🚀
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
