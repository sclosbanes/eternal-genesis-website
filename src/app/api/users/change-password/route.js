import { connectToDatabase } from '@/lib/db'
import CryptoJS from 'crypto-js'
import sql from 'mssql'

const SALT = process.env.SALT_PASSWORD || 'kikugalanet'

export async function POST(req) {
  try {
    const { account, password } = await req.json()
    const hashed = CryptoJS.MD5(SALT + password).toString()

    const pool = await connectToDatabase()
    await pool.request()
      .input('account', sql.VarChar, account)
      .input('password', sql.VarChar, hashed)
      .query(`
        UPDATE ACCOUNT_DBF.dbo.ACCOUNT_TBL
        SET password = @password
        WHERE account = @account
      `)

    return Response.json({ success: true })
  } catch (err) {
    console.error('Password Password change error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}