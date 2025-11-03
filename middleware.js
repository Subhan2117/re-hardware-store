import { NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

async function verifyFirebaseToken(token) {
  try {
    const { payload } = await jwtVerify(onIdTokenChanged, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return payload;
  } catch (e) {
    return null;
  }
}

export default async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const isAdmin = pathname.startsWith('/admin');
  const isUser = pathname.startsWith('/user');

  if (!isAdmin && !isUser) return NextResponse.next();

  // get the firebase session cookie

  const session = req.cookies.get('__session')?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  const claims = await verifyFirebaseToken(session);
  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const role = claims.role || 'user';

  if (isAdminPath) {
    if (role !== 'admin') {
      // Not an admin
      const url = req.nextUrl.clone();
      url.pathname = '/403';
      return NextResponse.rewrite(url);
    }
    // Require admin PIN step
    const unlocked = req.cookies.get('admin_unlocked')?.value === 'true';
    if (!unlocked) {
      const url = req.nextUrl.clone();
      url.pathname = '/login'; // single login route
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
