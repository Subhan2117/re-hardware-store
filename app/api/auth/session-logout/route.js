// app/api/auth/session-logout/route.js
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { path: '/', maxAge: 0 })
  res.cookies.set('admin_unlocked', '', { path: '/', maxAge: 0 })
  return res
}
