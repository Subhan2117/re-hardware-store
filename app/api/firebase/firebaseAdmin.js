// app/api/firebase/firebaseAdmin.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin env vars', {
      projectIdSet: !!projectId,
      clientEmailSet: !!clientEmail,
      privateKeySet: !!privateKey,
    });
    throw new Error('Missing Firebase Admin environment variables');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log('✅ Firebase Admin initialized (service account)');
}

const adminDb = admin.firestore();

export { admin, adminDb };
