'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import useRegister from '@/app/hooks/useRegister.jsx';

export default function RegisterClient() {
  const {
    fullName, setFullName,
    email, setEmail,
    password, setPassword,
    error, success,
    isGoogleLoading, isEmailLoading,
    handleGoogleSignUp,
    onEmailSubmit,
  } = useRegister();

  return (
    <div className="p-8 min-h-[600px] flex flex-col">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Register</h1>
      <p className="text-sm mb-6 text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isEmailLoading}
        className="border border-gray-300 mb-5 w-full py-2 rounded-2xl bg-gray-100
                   hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition
                   disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        aria-busy={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </span>
        ) : (
          'Sign in With Google'
        )}
      </button>

      {/* Messages */}
      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Email form */}
      <form onSubmit={onEmailSubmit} className="space-y-4 mt-2">
        <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-6 border-0 rounded-xl text-base md:text-lg text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
            required
            disabled={isGoogleLoading || isEmailLoading}
          />
        </div>

        <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-6 border-0 rounded-xl text-base md:text-lg text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
            required
            disabled={isGoogleLoading || isEmailLoading}
          />
        </div>

        <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-6 border-0 rounded-xl text-base md:text-lg text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
            required
            disabled={isGoogleLoading || isEmailLoading}
          />
        </div>

        <div className="flex items-center justify-center mt-6">
          <button
            type="submit"
            disabled={isEmailLoading || isGoogleLoading}
            className="px-5 h-11 rounded-full bg-amber-500 text-white font-semibold border border-amber-200/50
                       shadow-[0_8px_20px_rgba(245,158,11,0.35)]
                       hover:bg-amber-600 hover:shadow-[0_10px_24px_rgba(245,158,11,0.45)]
                       hover:-translate-y-0.5 active:translate-y-0 transition
                       disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={isEmailLoading}
          >
            {isEmailLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account…
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
