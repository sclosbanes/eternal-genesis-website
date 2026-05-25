import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import bcrypt from 'bcrypt'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/emailUtils'

const SALT_ROUNDS = 10
const AUTO_VERIFY_REGISTRATIONS = process.env.AUTO_VERIFY_REGISTRATIONS === 'true'

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, confirmPassword, pin, confirmPin } = body

    if (!email || !password || !confirmPassword || !pin || !confirmPin) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const allowedDomains = [
      'gmail.com',
      'outlook.com',
      'outlook.fr',
      'hotmail.com',
      'hotmail.fr',
      'live.com',
      'live.fr'
    ]

    const emailParts = normalizedEmail.split('@')
    const emailDomain = emailParts[1]

    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only Gmail, Outlook, Hotmail, and Live addresses are allowed.'
        },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Les mots de passe ne correspondent pas.' },
        { status: 400 }
      )
    }

    if (pin !== confirmPin) {
      return NextResponse.json(
        { success: false, error: 'Les PIN ne correspondent pas.' },
        { status: 400 }
      )
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'The PIN must contain 4 to 6 digits.' },
        { status: 400 }
      )
    }

    const db = await connectToDatabase()

    const existing = await db.query`
      SELECT email
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE email = ${normalizedEmail}
    `

    if (existing.recordset.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const pinHash = await bcrypt.hash(pin, SALT_ROUNDS)
    const verificationToken = AUTO_VERIFY_REGISTRATIONS ? null : generateVerificationToken()
    const tokenExpiresAt = AUTO_VERIFY_REGISTRATIONS ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
    const emailVerified = AUTO_VERIFY_REGISTRATIONS ? 1 : 0

    await db.query`
      INSERT INTO WEBSITE_DBF.dbo.REGISTERED_USERS (
        email,
        password_hash,
        pin_hash,
        role,
        verification_token,
        email_verified,
        is_active,
        token_expires_at,
        created_at
      )
      VALUES (
        ${normalizedEmail},
        ${passwordHash},
        ${pinHash},
        ${'user'},
        ${verificationToken},
        ${emailVerified},
        ${1},
        ${tokenExpiresAt},
        ${new Date()}
      )
    `

    if (AUTO_VERIFY_REGISTRATIONS) {
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. You can now log in.'
      })
    }

    const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken)

    if (!emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Account created, but the verification email could not be sent. Please use the resend verification option.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please verify your email to activate your account.'
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error during registration. Please try again.'
      },
      { status: 500 }
    )
  }
}
