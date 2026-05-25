import { connectToDatabase } from '@/lib/db'
import crypto from 'crypto'
import sql from 'mssql'

const SALT = process.env.SALT_PASSWORD || 'kikugalanet'

const MAX_ACCOUNT = 16
const MAX_EMAIL = 100

export async function POST(req) {
  try {
    const body = await req.json()
    const { username, password, repeatpass, emailadd } = body

    if (!username || !password || !repeatpass || !emailadd) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const account = String(username).trim().slice(0, MAX_ACCOUNT)
    const email = String(emailadd).trim().slice(0, MAX_EMAIL)
    const realname = 'A'

    if (account.length === 0) {
      return Response.json({ error: 'Account name is required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format.' }, { status: 400 })
    }

    if (password !== repeatpass) {
      return Response.json({ error: 'Passwords do not match.' }, { status: 400 })
    }

    if (account.length < String(username).trim().length) {
      return Response.json({ error: `Account name must contain at most ${MAX_ACCOUNT} characters.` }, { status: 400 })
    }

    const hashedPassword = crypto.createHash('md5').update(SALT + password).digest('hex')
    const pool = await connectToDatabase()

    const userCheck = await pool
      .request()
      .input('username', sql.VarChar(32), account)
      .query(`SELECT COUNT(*) as count FROM [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL] WHERE account = @username`)

    if (userCheck.recordset[0].count > 0) {
      return Response.json({ error: 'This account name already exists.' }, { status: 400 })
    }

    await pool
      .request()
      .input('username', sql.VarChar(32), account)
      .input('password', sql.VarChar(32), hashedPassword)
      .input('realname', sql.Char(1), realname)
      .query(`
        INSERT INTO [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL] (account, password, realname, isuse, member)
        VALUES (@username, @password, @realname, 'T', 'A')
      `)

    await pool
      .request()
      .input('username', sql.VarChar(32), account)
      .input('email', sql.VarChar(100), email)
      .input('regdate', sql.DateTime, new Date())
      .query(`
        INSERT INTO [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL_DETAIL]
        (account, gamecode, tester, m_chLoginAuthority, regdate, BlockTime, EndTime, WebTime, isuse, email)
        VALUES (@username, 'A000', '2', 'S', @regdate, '0', '0', '0', 'T', @email)
      `)

    return Response.json({ success: 'Game account created successfully!' })
  } catch (err) {
    console.error('Create account error:', err)
    return Response.json({ error: 'Server error. Please try again later.' }, { status: 500 })
  }
}
