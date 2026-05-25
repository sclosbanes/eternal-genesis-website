import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/emailUtils'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required.'
      }, { status: 400 })
    }

    const db = await connectToDatabase()

    const result = await db.query`
      SELECT email_verified
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE email = ${email}
    `

    const user = result.recordset[0]

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No account was found with this email address.'
      }, { status: 404 })
    }

    if (user.email_verified) {
      return NextResponse.json({
        success: false,
        error: 'This email is already verified.'
      }, { status: 400 })
    }

    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.query`
      UPDATE WEBSITE_DBF.dbo.REGISTERED_USERS
      SET 
        verification_token = ${verificationToken},
        token_expires_at = ${tokenExpiresAt}
      WHERE email = ${email}
    `

    const emailSent = await sendVerificationEmail(email, verificationToken)

    if (!emailSent) {
      return NextResponse.json({
        success: false,
        error: 'Could not send the verification email. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred while resending the verification email.'
    }, { status: 500 })
  }
}