'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Hammer, Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../api/login/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout, role } = useAuth(); // 🔥 role from context

  const router = useRouter();
  const pathname = usePathname();

  const displayName =
    currentUser?.displayName || currentUser?.email || 'Account';
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Store', href: '/store' },
    { label: 'About', href: '/about' },
    { label: 'Track Order', href: '/tracking' },
  ];

  // Don’t show navbar on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isLoggedIn = !!currentUser;
  const handleLogout = async () => {
    try {
      await logout(); // this already clears cookies + sets role=null in context

      // If you don’t actually have this route, you can remove this call
      await fetch('/api/auth/session-logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      // Extra cookie clearing is optional now; logout() already did it
      if (typeof document !== 'undefined') {
        document.cookie = 'logged_in=; path=/; max-age=0';
        document.cookie = 'role=; path=/; max-age=0';
      }

      setUserMenuOpen(false);
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 bg-white/40 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Re&apos;s Hardware
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-slate-600 hover:text-amber-600 transition-all ease-in-out duration-300 font-medium px-4 py-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-md"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="text-slate-600 hover:text-amber-600 transition-all ease-in-out duration-300 font-medium px-4 py-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-md"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Actions + Mobile toggle */}
          <div className=" hidden md:flex items-center space-x-3">
            <button className="text-slate-600 hover:text-amber-600 transition-all duration-300 mr-2">
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-slate-600 hover:text-amber-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-amber-600 text-white rounded-full px-1.5 py-0.5">
                    {totalItems}
                  </span>
                )}
              </Link>
            </button>
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="text-amber-700 bg-amber-50/80 hover:bg-amber-100 shadow-lg shadow-amber-500/20 transition-all duration-300 md:px-6 md:py-2 px-3 py-1 rounded-2xl"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 md:px-6 md:py-2 px-2 py-1 rounded-2xl"
                >
                  Get Started
                </Link>
              </>
            ) : (
              // User dropdown
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-800 max-w-[140px] truncate">
                    {displayName}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg text-sm overflow-hidden">
                    <Link
                      href="/user/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-50"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/user/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-50"
                    >
                      My Orders
                    </Link>
                    {isLoggedIn && role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:text-amber-700 hover:bg-white/60 transition"
                      >
                        Admin Portal
                      </Link>
                    )}
                    {/* Later you can conditionally show Admin Portal here if user is admin */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Hamburger (mobile only) */}
          <button className=" md:hidden text-slate-600 hover:text-amber-600 transition-all duration-300 ">
            <Link href={'/cart'}>
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </button>
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/40"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-6 w-6 text-slate-800" />
            ) : (
              <Menu className="h-6 w-6 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${
          open
            ? 'max-h-[80vh] opacity-100 overflow-y-auto'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-6 pb-4 pt-0 space-y-2 bg-white/60 backdrop-blur-xl border-t border-slate-200/50">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:text-amber-700 hover:bg-white/60 transition"
            >
              {item.label}
            </Link>
          ))}
          {role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:text-amber-700 hover:bg-white/60 transition"
            >
              Admin Portal
            </Link>
          )}
          {/* Mobile-only actions */}
          <div className="flex gap-3">
            {/* Mobile-only actions */}
            {!isLoggedIn ? (
              <div className="flex-2 gap-3 ">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className=" text-center text-amber-700 bg-amber-50/80 hover:bg-amber-100 rounded-xl px-4 py-3 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className=" text-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl px-4 py-3 font-semibold"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  href="/user/profile"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:text-amber-700 hover:bg-white/60 transition"
                >
                  My Profile
                </Link>
                <Link
                  href="/user/orders"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:text-amber-700 hover:bg-white/60 transition"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
