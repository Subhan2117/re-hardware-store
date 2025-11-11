import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';
import LiquidEther from '../../component/background/LiquidEther';
import LoginClient from './LoginClient';
import { Suspense } from 'react';

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
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-end mt-20">
          <p className="flex flex-col text-xs md:text-sm text-gray-600 text-right">
            Don&apos;t have an account?
            <Link
              href="/register"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </header>

      {/* Card */}
      <main className="relative z-10 flex justify-center mt-10">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/80 border border-amber-200/40 shadow-2xl rounded-2xl p-8">
          <Suspense fallback={<div>Loading login…</div>}>
            <LoginClient />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
