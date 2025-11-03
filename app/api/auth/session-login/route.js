import { NextResponse } from 'next/server';
import admin from '@/app/api/firebase/firebaseAdmin';

export async function POST(req) {
  try {
    const { idToken, mode, pin } = await req.json();
    if (!idToken)
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });

    // Verify ID token & read custom claims
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const user = await admin.auth().getUser(decoded.uid);
    const role = (user.customClaims && user.customClaims.role) || 'user';

    // Create the session cookie (used by middleware)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true, role });
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(expiresIn / 1000),
    });

    // If admin mode, require both: admin claim + correct PIN
    if (mode === 'admin') {
      const pinOk = process.env.ADMIN_PIN && pin === process.env.ADMIN_PIN;
      if (role === 'admin' && pinOk) {
        res.cookies.set('admin_unlocked', 'true', {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60, // 1 hour
        });
      } else {
        // clear any previous unlock and let client know they’re just logged as user
        res.cookies.set('admin_unlocked', '', { path: '/', maxAge: 0 });
        return NextResponse.json(
          {
            ok: true,
            role,
            adminUnlocked: false,
            reason: 'Invalid PIN or not an admin',
          },
          { headers: res.headers }
        );
      }
    } else {
      // user mode — ensure admin_unlocked is cleared
      res.cookies.set('admin_unlocked', '', { path: '/', maxAge: 0 });
    }

    return res;
  } catch {
    return NextResponse.json(
      { error: 'session-login failed' },
      { status: 500 }
    );
  }
}
