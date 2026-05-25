import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { createLoginCookie, createSessionToken } from '@/lib/sessionCookie'
import bcrypt from 'bcrypt'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const db = await connectToDatabase()

    const result = await db.query`
      SELECT 
        email,
        password_hash,
        email_verified,
        is_active,
        role,
        verification_token,
        token_expires_at
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE email = ${username}
    `

    const user = result.recordset[0]

    if (!user || !user.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.password_hash)

    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.email_verified) {
      const tokenExpired = user.token_expires_at && new Date(user.token_expires_at) < new Date()

      if (tokenExpired) {
        return NextResponse.json({
          success: false,
          error: 'Email verification has expired. Please request a new verification email.',
          code: 'VERIFICATION_EXPIRED'
        }, { status: 403 })
      }

      return NextResponse.json({
        success: false,
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 })
    }

    if (!user.is_active) {
      return NextResponse.json({ success: false, error: 'The account is inactive.' }, { status: 403 })
    }

    const normalizedRole =
      typeof user.role === 'string' && user.role.trim()
        ? user.role.trim().toLowerCase()
        : 'user'

    const safeRole = normalizedRole === 'super' ? 'super' : 'user'
    const sessionToken = createSessionToken({ email: user.email, role: safeRole })

    const res = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        email_verified: user.email_verified,
        is_active: user.is_active,
        role: safeRole,
      },
    })

    res.headers.set(
      'Set-Cookie',
      createLoginCookie(sessionToken)
    )

    return res
  } catch (err) {
    console.error('[LOGIN ERROR]', err)
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login. Please try again.'
    }, { status: 500 })
  }
}
