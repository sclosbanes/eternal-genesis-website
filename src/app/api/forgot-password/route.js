import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import bcrypt from 'bcrypt'
import { sendTemporaryPasswordEmail } from '@/lib/emailUtils'

const SALT_ROUNDS = 10

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let temp = ''
  for (let i = 0; i < 12; i++) {
    temp += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return temp
}

export async function POST(request) {
  try {
    const { email, pin } = await request.json()

    if (!email || !pin) {
      return NextResponse.json({ 
        success: false, 
        error: 'L email et le PIN sont obligatoires.' 
      }, { status: 400 })
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ 
        success: false, 
        error: 'The PIN must contain 4 to 6 digits.' 
      }, { status: 400 })
    }

    const db = await connectToDatabase()

    const result = await db.query`
      SELECT email, email_verified, pin_hash
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

    if (!user.email_verified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please verify your email address first.' 
      }, { status: 400 })
    }

    const pinMatch = await bcrypt.compare(pin, user.pin_hash)
    if (!pinMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'PIN invalide.' 
      }, { status: 401 })
    }

    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS)

    await db.query`
      UPDATE WEBSITE_DBF.dbo.REGISTERED_USERS
      SET password_hash = ${hashedPassword}
      WHERE email = ${email}
    `

    const emailSent = await sendTemporaryPasswordEmail(email, tempPassword)

    if (!emailSent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not send the temporary password email. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'A temporary password has been sent to your email address.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred. Please try again.' 
    }, { status: 500 })
  }
}