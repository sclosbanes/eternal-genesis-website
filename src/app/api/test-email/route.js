import { NextResponse } from 'next/server'
import { verifyEmailConfig } from '@/lib/emailUtils'

export async function GET() {
  if (process.env.ALLOW_DIAGNOSTICS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const isValid = await verifyEmailConfig()

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Email configuration is valid.',
        config: {
          smtp_host: process.env.SMTP_HOST ? 'Configured' : 'Missing',
          smtp_port: process.env.SMTP_PORT ? 'Configured' : 'Missing',
          smtp_user: process.env.SMTP_USER ? 'Configured' : 'Missing',
          smtp_pass: process.env.SMTP_PASS ? 'Configured' : 'Missing',
          mail_from: process.env.MAIL_FROM ? 'Configured' : 'Missing',
          app_url:
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXTAUTH_URL ||
            'Missing'
        }
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Email configuration is invalid.',
        config: {
          smtp_host: process.env.SMTP_HOST ? 'Configured' : 'Missing',
          smtp_port: process.env.SMTP_PORT ? 'Configured' : 'Missing',
          smtp_user: process.env.SMTP_USER ? 'Configured' : 'Missing',
          smtp_pass: process.env.SMTP_PASS ? 'Configured' : 'Missing',
          mail_from: process.env.MAIL_FROM ? 'Configured' : 'Missing',
          app_url:
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXTAUTH_URL ||
            'Missing'
        }
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error'
      },
      { status: 500 }
    )
  }
}
