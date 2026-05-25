import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'
import { safeUploadName, validateImageUpload } from '@/lib/uploadValidation'
import { parseSessionToken } from '@/lib/sessionCookie'

async function requireAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('flyff_session')

  if (!session?.value) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }

  const parsedSession = parseSessionToken(session.value)
  if (!parsedSession?.email) {
    return { ok: false, status: 401, error: 'Invalid session' }
  }

  const email = parsedSession.email
  const pool = await connectToDatabase()
  const result = await pool.request()
    .input('email', email)
    .query(`
      SELECT role
      FROM WEBSITE_DBF.dbo.REGISTERED_USERS
      WHERE email = @email
    `)

  const role = String(result.recordset[0]?.role || 'user').trim().toLowerCase()
  if (role !== 'super') {
    return { ok: false, status: 403, error: 'Unauthorized' }
  }

  return { ok: true, pool }
}

export async function GET() {
  const pool = await connectToDatabase()
  const result = await pool.request().query('SELECT * FROM WEBSITE_DBF.dbo.NewsPosts ORDER BY created_at DESC')
  return NextResponse.json(result.recordset)
}

export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const formData = await req.formData()
  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  const image = formData.get('image')

  if (!title || !content || !image) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const imageError = validateImageUpload(image)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 400 })
  }

  const buffer = Buffer.from(await image.arrayBuffer())
  const safeName = safeUploadName(image.name)
  const fileName = `${uuidv4()}-${safeName}`
  const filePath = path.join(process.cwd(), 'public/uploads', fileName)
  await writeFile(filePath, buffer)

  const imageUrl = `/uploads/${fileName}`

  await admin.pool.request()
    .input('title', title)
    .input('content', content)
    .input('image_url', imageUrl)
    .query(`
      INSERT INTO WEBSITE_DBF.dbo.NewsPosts (title, content, image_url)
      VALUES (@title, @content, @image_url)
    `)

  return NextResponse.json({ success: true })
}
