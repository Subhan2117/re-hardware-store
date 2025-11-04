'use client';

import Link from 'next/link';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import useLogin from '@/app/hooks/useLogin.jsx';

export default function LoginClient() {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    isEmailLoading,
    isGoogleLoading,
    onEmailSubmit,
    onGoogleSignIn,
  } = useLogin();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await onEmailSubmit(e);

      if (!isAdmin) {
        return;
      }

      const idTokenResult = await user.getIdTokenResult(true);

      if (!idTokenResult.claims.admin) {
        alert("Unauthorized. Admin access only");
        await user.auth.signOut();
        return;
      }

      console.log("Admin authenticated");
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("login failed:", err);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-lg text-center md:text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 text-transparent bg-clip-text mb-3">
          Welcome Back
        </h1>
        <h2 className="text-center text-gray-800">
          Sign in to access tools, orders, and services
        </h2>
      </div>

      <div className="flex justify-center">
        <button
          className="border border-gray-300 mb-5 w-full py-2 rounded-2xl bg-gray-100 shadow-sm
                     hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition
                     disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onGoogleSignIn}
          disabled={isGoogleLoading || isEmailLoading}
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
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        {/* User/Admin Toggle (Two-button style) */}
        <div className="flex justify-center mb-4">
          <div className="flex w-[220px] bg-gray-100 rounded-full p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                !isAdmin
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isAdmin
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2 text-sm font-semibold text-slate-700">
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
            disabled={isGoogleLoading || isEmailLoading}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2 text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              required
              disabled={isGoogleLoading || isEmailLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <Eye className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Admin Key */}
        {isAdmin && (
          <div className="flex flex-col">
            <label htmlFor="adminKey" className="mb-2 text-sm font-semibold text-slate-700">
              Admin Key
            </label>
            <input
              id="adminKey"
              type="text"
              placeholder="Enter Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 border border-red-200 rounded-xl text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              required
            />
          </div>
        )}

        {/* Extras */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              disabled={isGoogleLoading || isEmailLoading}
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

        {/* Submit */}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600
                       hover:from-orange-700 hover:to-amber-700 rounded-xl font-semibold text-white
                       shadow-lg hover:shadow-xl transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isEmailLoading || isGoogleLoading}
            aria-busy={isEmailLoading}
          >
            {isEmailLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              isAdmin ? 'Sign In as Admin' : 'Sign In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
