'use client';

import LiquidEther from '../../component/background/LiquidEther';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Hammer } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Lock } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import uselogin from '@/app/hooks/useLogin';

// import { useAuth } from '@/api/login/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { googleAuth } from '@/api/firebase/firebase';

export default function page() {
  const router = useRouter();
  // const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showPassword, setShowPassword } = uselogin();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await googleAuth();
      router.push('/');
    } catch (error) {
      alert('Google sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden relative  px-4">
      <div className=" absolute inset-0">
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
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 hover:bg-white/50 rounded-xl">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Re's Hardware
              </h1>
            </div>
          </Link>
          <p className="flex flex-col text-xs md:text-sm text-gray-600">
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

      <div className="flex justify-center mt-20">
        <div className="relative w-full max-w-md backdrop-blur-lg bg-white/80 border  border-amber-200/40 shadow-2xl rounded-2xl p-8 z-10">
          <div>
            <div className="mb-10">
              <h1 className="text-lg text-center md:text-2xl font-bold md:font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 text-transparent bg-clip-text mb-3">
                Welcome Backs
              </h1>
              <h2 className="text-center text-gray-800">
                Sign in to access tools, orders, and services{' '}
              </h2>
            </div>

            <div className="flex justify-center">
              <button
                className="border border-gray-300 mb-5 w-full py-2 rounded-2xl shadow-2xl bg-gray-100 hover:bg-gray-200 cursor-pointer"
                onClick={handleGoogleSignIn}
              >
                Sign in With Google
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            {/* Email */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-2 text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-2 text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="flex justify-between relative">
                {' '}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 px-4 py-3 border border-slate-200 rounded-xl text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
