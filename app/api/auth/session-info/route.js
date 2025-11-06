import admin from '@/app/api/firebase/admin';

// Return basic session info for the authenticated user.
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.replace(/^Bearer\s+/i, '');
    if (!idToken) return new Response(JSON.stringify({ error: 'Missing id token' }), { status: 401 });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRecord = await admin.auth().getUser(uid);

    // return safe subset
    const payload = {
      uid: userRecord.uid,
      email: userRecord.email || null,
      emailVerified: !!userRecord.emailVerified,
      lastSignInTime: userRecord.metadata?.lastSignInTime || null,
      creationTime: userRecord.metadata?.creationTime || null,
      tokensValidAfterTime: userRecord.tokensValidAfterTime || null,
    };

    return new Response(JSON.stringify({ ok: true, data: payload }), { status: 200 });
  } catch (err) {
    console.error('session-info error', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed' }), { status: 500 });
  }
}
