import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')?.trim()

    console.log('Received verification request for token:', token)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'The verification token is missing.'
        },
        { status: 400 }
      )
    }

    const db = await connectToDatabase()

    const checkResult = await db.query`
      SELECT 
        email,
        email_verified,
        verification_token,
        token_expires_at
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE verification_token = ${token}
    `

    const user = checkResult.recordset[0]

    if (!user) {
      console.log('No user found with token:', token)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification token. Please request a new verification email.'
        },
        { status: 400 }
      )
    }

    if (user.email_verified === 1 || user.email_verified === true) {
      console.log('Email already verified for user:', user.email)
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified. You can now sign in.'
        },
        { status: 200 }
      )
    }

    if (!user.token_expires_at) {
      console.log('Token expiration date missing for user:', user.email)
      return NextResponse.json(
        {
          success: false,
          error: 'The verification token is invalid. Please request a new one.'
        },
        { status: 400 }
      )
    }

    const now = new Date()
    const expiryDate = new Date(user.token_expires_at)

    if (isNaN(expiryDate.getTime()) || expiryDate < now) {
      console.log('Token expired or invalid:', {
        token,
        email: user.email,
        expiryDate: user.token_expires_at,
        now: now.toISOString()
      })

      return NextResponse.json(
        {
          success: false,
          error: 'The verification token has expired. Please request a new one.'
        },
        { status: 400 }
      )
    }

    try {
      await db.query`
        UPDATE WEBSITE_DBF.dbo.REGISTERED_USERS
        SET
          email_verified = 1,
          verification_token = NULL,
          token_expires_at = NULL
        WHERE verification_token = ${token}
      `

      const verifyResult = await db.query`
        SELECT email, email_verified
        FROM WEBSITE_DBF.dbo.REGISTERED_USERS
        WHERE email = ${user.email}
      `

      const verifiedUser = verifyResult.recordset[0]
      const isVerified =
        verifiedUser?.email_verified === 1 ||
        verifiedUser?.email_verified === true

      console.log('Update result:', {
        email: verifiedUser?.email,
        isVerified
      })

      if (!verifiedUser || !isVerified) {
        throw new Error('Verification update failed')
      }

      console.log('Successsfully verified email for:', user.email)

      return NextResponse.json(
        {
          success: true,
          message: 'Email verifie avec succes ! Vous pouvez maintenant vous connecter.'
        },
        { status: 200 }
      )
    } catch (updateError) {
      console.error('Failed to update verification status:', updateError)

      return NextResponse.json(
        {
          success: false,
          error: 'Could not verify the email. Please try again.'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during verification. Please try again.'
      },
      { status: 500 }
    )
  }
}