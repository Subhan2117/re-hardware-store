import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const loggedIn = req.cookies.get('logged_in')?.value === 'true';
  const role = req.cookies.get('role')?.value;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Not logged in → go to login
    if (!loggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in but not admin → send to store or home
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/store', req.url));
    }
  }

  // Example: protect /account routes for any logged-in user
  if (pathname.startsWith('/account')) {
    if (!loggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
