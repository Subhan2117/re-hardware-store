import admin from '@/app/api/firebase/admin';

// Revoke refresh tokens for the authenticated user (sign out other sessions).
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.replace(/^Bearer\s+/i, '');
    if (!idToken) return new Response(JSON.stringify({ error: 'Missing id token' }), { status: 401 });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    await admin.auth().revokeRefreshTokens(uid);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('revoke-refresh error', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed' }), { status: 500 });
  }
}
