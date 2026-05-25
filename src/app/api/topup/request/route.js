import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { cookies } from 'next/headers'
import { safeUploadName, validateImageUpload } from '@/lib/uploadValidation'
import { parseSessionToken } from '@/lib/sessionCookie'

async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get('flyff_session')

  if (!session?.value) {
    return { ok: false, error: 'Unauthorized', status: 401 }
  }

  const parsedSession = parseSessionToken(session.value)
  if (!parsedSession?.email) {
    return { ok: false, error: 'Invalid session', status: 401 }
  }

  const email = parsedSession.email
  const db = await connectToDatabase()

  const userResult = await db.request()
    .input('email', email)
    .query(`
      SELECT id, email, role
      FROM [WEBSITE_DBF].[dbo].[REGISTERED_USERS]
      WHERE email = @email
    `)

  const user = userResult.recordset[0]

  if (!user) {
    return { ok: false, error: 'User not found', status: 404 }
  }

  return { ok: true, user, db }
}

export async function POST(req) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { user, db } = auth

    const formData = await req.formData()
    const itemId = formData.get('itemId')
    const username = formData.get('username')
    const attachment = formData.get('attachment')

    if (!itemId || !username || !attachment) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const attachmentError = validateImageUpload(attachment)
    if (attachmentError) {
      return NextResponse.json({ error: attachmentError }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'topup')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await attachment.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${uuidv4()}-${safeUploadName(attachment.name)}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const attachmentUrl = `/uploads/topup/${filename}`

    const itemResult = await db.request()
      .input('id', itemId)
      .query(`
        SELECT id, price, points
        FROM [WEBSITE_DBF].[dbo].[topup_items]
        WHERE id = @id
      `)

    const item = itemResult.recordset[0]

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const insertResult = await db.request()
      .input('user_id', user.id || null)
      .input('item_id', item.id)
      .input('username', username)
      .input('amount', item.price)
      .input('points', item.points)
      .input('attachment_url', attachmentUrl)
      .query(`
        INSERT INTO [WEBSITE_DBF].[dbo].[topup_requests]
        (user_id, item_id, username, amount, points, attachment_url, status)
        OUTPUT INSERTED.id
        VALUES
        (@user_id, @item_id, @username, @amount, @points, @attachment_url, 'pending')
      `)

    return NextResponse.json({
      success: true,
      message: 'Top-up request sent successfully',
      requestId: insertResult.recordset[0]?.id || null
    })
  } catch (error) {
    console.error('Top-up request error:', error)
    return NextResponse.json(
      { error: 'Could not send the top-up request' },
      { status: 500 }
    )
  }
}
