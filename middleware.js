// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const loggedIn = req.cookies.get('logged_in')?.value === 'true';
  const role = req.cookies.get('role')?.value; // 'admin' | 'user' | undefined

  // Protect admin routes: must be logged in AND admin
  if (pathname.startsWith('/admin')) {
    if (!loggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'admin') {
      // logged in but not admin → bounce to store (or 403 page)
      return NextResponse.redirect(new URL('/store', req.url));
    }
  }

  // Protect /account routes: must be logged in
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
