import { NextResponse } from 'next/server'
import admin from '@/lib/firebaseAdmin'

export async function POST(req) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, role } = await req.json()
  if (!email || !role) {
    return NextResponse.json({ error: 'email and role required' }, { status: 400 })
  }

  try {
    const user = await admin.auth().getUserByEmail(email)
    await admin.auth().setCustomUserClaims(user.uid, { role }) // 'admin' or 'user'
    return NextResponse.json({ ok: true, uid: user.uid, role })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 })
  }
}
