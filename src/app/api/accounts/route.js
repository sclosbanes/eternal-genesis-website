export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/db'
import { parseSessionToken } from '@/lib/sessionCookie'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('flyff_session')

  if (!session?.value) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsedSession = parseSessionToken(session.value)
  if (!parsedSession?.email) {
    return Response.json({ error: 'Invalid session' }, { status: 401 })
  }

  const email = parsedSession.email

  try {
    const pool = await connectToDatabase()
    const result = await pool
      .request()
      .input('email', email)
      .query(`
        SELECT a.email as email,a.account AS name, a.regdate,b.cash as cash,b.votepoint as votepoint FROM [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL_DETAIL] a
        LEFT OUTER JOIN [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL] b ON a.account = b.account
        WHERE a.email = @email
      `)

    return Response.json({ success: true, accounts: result.recordset })
  } catch (err) {
    console.error('Error fetching accounts:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
