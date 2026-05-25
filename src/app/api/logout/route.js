// /src/app/api/logout/route.js
import { NextResponse } from 'next/server'
import { createLogoutCookie } from '@/lib/sessionCookie'

export async function GET() {
  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', createLogoutCookie())
  return res
}
