import nodemailer from 'nodemailer'
import crypto from 'crypto'

const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP credentials are not configured. Please define SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment variables.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  })
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex')
}

export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter()
    const verification = await transporter.verify()
    console.log('Email configuration is valid:', verification)
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}

export async function sendVerificationEmail(email, token) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://EternalMMOGenesis.com'
    const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER

    const transporter = createTransporter()
    const verificationLink = `${baseUrl}/verify-email?token=${token}`

    const mailOptions = {
      from: mailFrom,
      to: email,
      subject: 'Verify your Eternal MMO : Genesis account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Eternal MMO : Genesis account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f4;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td align="center" style="padding: 40px 0; background-color: #1a1a1a;">
                      <img src="${baseUrl}/newlogo.png" alt="Logo Eternal MMO : Genesis" style="width: 200px; height: auto;">
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="margin: 0 0 20px; color: #eab308; text-align: center; font-size: 24px;">
                        Welcome to Eternal MMO : Genesis!
                      </h1>

                      <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.5; text-align: center;">
                        Thank you for registering. To begin your adventure, please verify your email address by clicking the button below:
                      </p>

                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationLink}"
                               style="display: inline-block; padding: 14px 30px; background-color: #eab308; color: #000000; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                              Verify email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; color: #666; font-size: 14px; text-align: center;">
                        This verification link will expire in 24 hours.
                      </p>

                      <p style="margin: 20px 0; color: #666; font-size: 14px; text-align: center;">
                        If the button does not work, copy and paste this link into your browser:
                        <br>
                        <a href="${verificationLink}" style="color: #0066cc; text-decoration: none; word-break: break-all;">
                          ${verificationLink}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px; background-color: #1a1a1a; color: #ffffff; text-align: center;">
                      <p style="margin: 0; font-size: 14px;">
                        (c) ${new Date().getFullYear()} Eternal MMO : Genesis. All rights reserved.
                      </p>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
                        If you did not create an account on Eternal MMO : Genesis, please ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    await transporter.verify()
    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Verification email send error:', {
      message: error.message,
      code: error.code,
      command: error.command
    })
    return false
  }
}

export async function sendTemporaryPasswordEmail(email, tempPassword) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://EternalMMOGenesis.com'
    const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER

    const transporter = createTransporter()
    const loginLink = `${baseUrl}/login`

    const mailOptions = {
      from: mailFrom,
      to: email,
      subject: 'Your temporary password for Eternal MMO : Genesis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your temporary password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f4;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td align="center" style="padding: 40px 0; background-color: #1a1a1a;">
                      <img src="${baseUrl}/newlogo.png" alt="Logo Eternal MMO : Genesis" style="width: 200px; height: auto;">
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="margin: 0 0 20px; color: #eab308; text-align: center; font-size: 24px;">
                        Password reset
                      </h1>

                      <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.5; text-align: center;">
                        You requested a password reset. Here is your temporary password:
                      </p>

                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f8f8; border-radius: 5px; text-align: center;">
                        <code style="font-size: 24px; color: #eab308; font-weight: bold; letter-spacing: 2px;">
                          ${tempPassword}
                        </code>
                      </div>

                      <p style="margin: 20px 0; color: #333; font-size: 16px; line-height: 1.5; text-align: center;">
                        Use this temporary password to sign in. We recommend changing it immediately after login.
                      </p>

                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${loginLink}"
                               style="display: inline-block; padding: 14px 30px; background-color: #eab308; color: #000000; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                              Log in now
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; color: #666; font-size: 14px; text-align: center;">
                        For security, please change this password immediately after signing in.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px; background-color: #1a1a1a; color: #ffffff; text-align: center;">
                      <p style="margin: 0; font-size: 14px;">
                        (c) ${new Date().getFullYear()} Eternal MMO : Genesis. All rights reserved.
                      </p>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
                        If you did not request this password reset, please contact support immediately.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    await transporter.verify()
    const info = await transporter.sendMail(mailOptions)
    console.log('Temporary password email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error while sending temporary password email:', {
      message: error.message,
      code: error.code,
      command: error.command
    })
    return false
  }
}
