export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/db'
import { parseSessionToken } from '@/lib/sessionCookie'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('flyff_session')

    if (!session?.value) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const parsedSession = parseSessionToken(session.value)
    if (!parsedSession?.email) {
      return new Response(JSON.stringify({ error: 'Format de session invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const email = parsedSession.email

    const db = await connectToDatabase()
    const result = await db.query`
      SELECT email, role
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE email = ${email}
    `

    const user = result.recordset[0]

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const normalizedRole =
      typeof user.role === 'string' && user.role.trim()
        ? user.role.trim().toLowerCase()
        : 'user'

    const role = normalizedRole === 'super' ? 'super' : 'user'

    return new Response(JSON.stringify({
      success: true,
      email: user.email,
      role
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('[API /me] Unexpected Error:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
