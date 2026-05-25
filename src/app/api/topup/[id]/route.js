export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { safeUploadName, validateImageUpload } from '@/lib/uploadValidation'
import { parseSessionToken } from '@/lib/sessionCookie'

async function checkAdmin() {
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
  const pool = await connectToDatabase()

  const userResult = await pool.request()
    .input('email', email)
    .query(`
      SELECT email, role
      FROM [WEBSITE_DBF].[dbo].[REGISTERED_USERS]
      WHERE email = @email
    `)

  const user = userResult.recordset[0]

  if (!user) {
    return { ok: false, error: 'User not found', status: 404 }
  }

  const normalizedRole =
    typeof user.role === 'string' ? user.role.trim().toLowerCase() : 'user'

  if (normalizedRole !== 'super') {
    return { ok: false, error: 'Unauthorized', status: 403 }
  }

  return { ok: true, pool }
}

function normalizePointType(value, fallbackCategory = '') {
  const raw = String(value || '').trim().toLowerCase()
  const category = String(fallbackCategory || '').trim().toLowerCase()

  if (raw === 'vote' || category === 'vote') return 'vote'
  return 'donate'
}

async function getRouteId(params) {
  const resolvedParams = await params
  const id = Number(resolvedParams?.id)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

export async function PUT(request, { params }) {
  try {
    const adminCheck = await checkAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const id = await getRouteId(params)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const formData = await request.formData()

    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const price = Number(formData.get('price'))
    const points = Number(formData.get('points'))
    const pointsType = normalizePointType(formData.get('pointsType'), formData.get('category'))
    const category = pointsType
    const isOnSale = formData.get('isOnSale') === 'true'
    const salePercentageRaw = formData.get('salePercentage')
    const salePercentage = salePercentageRaw !== null && salePercentageRaw !== '' ? Number(salePercentageRaw) : 0
    const image = formData.get('image')

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required.' }, { status: 400 })
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price.' }, { status: 400 })
    }

    if (!Number.isFinite(points) || points <= 0 || !Number.isInteger(points)) {
      return NextResponse.json({ error: 'Le nombre de points doit etre un entier positif.' }, { status: 400 })
    }

    if (salePercentage !== null && (!Number.isFinite(salePercentage) || salePercentage < 0 || salePercentage > 100)) {
      return NextResponse.json({ error: 'Invalid sale percentage.' }, { status: 400 })
    }

    let imageUrl = undefined

    if (image && typeof image === 'object' && image.size > 0) {
      const imageError = validateImageUpload(image, { required: false })
      if (imageError) {
        return NextResponse.json({ error: imageError }, { status: 400 })
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const safeName = safeUploadName(image.name)
      const buffer = Buffer.from(await image.arrayBuffer())
      const fileName = `${uuidv4()}-${safeName}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }

    let updateQuery = `
      UPDATE [WEBSITE_DBF].[dbo].[topup_items]
      SET
        name = @name,
        description = @description,
        price = @price,
        points = @points,
        points_type = @pointsType,
        category = @category,
        is_on_sale = @isOnSale,
        sale_percentage = @salePercentage,
        is_active = 1,
        updated_at = GETDATE()
    `

    if (imageUrl !== undefined) {
      updateQuery += `, image_url = @imageUrl`
    }

    updateQuery += `
      OUTPUT INSERTED.*
      WHERE id = @id
    `

    const dbRequest = adminCheck.pool.request()
      .input('id', id)
      .input('name', name)
      .input('description', description)
      .input('price', price)
      .input('points', points)
      .input('pointsType', pointsType)
      .input('category', category)
      .input('isOnSale', isOnSale ? 1 : 0)
      .input('salePercentage', salePercentage)

    if (imageUrl !== undefined) {
      dbRequest.input('imageUrl', imageUrl)
    }

    const result = await dbRequest.query(updateQuery)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error('[TOPUP PUT ERROR]', error)
    return NextResponse.json({ error: 'Error while updating the pack' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const adminCheck = await checkAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const id = await getRouteId(params)
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Suppression logique volontaire : on garde l'historique PayPal / commandes,
    // but the pack disappears from the shop and admin panel.
    const result = await adminCheck.pool.request()
      .input('id', id)
      .query(`
        UPDATE [WEBSITE_DBF].[dbo].[topup_items]
        SET
          is_active = 0,
          is_on_sale = 0,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
          AND ISNULL(is_active, 1) = 1
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Pack not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.recordset[0] })
  } catch (error) {
    console.error('[TOPUP DELETE ERROR]', error)
    return NextResponse.json({ error: 'Error while deleting the pack' }, { status: 500 })
  }
}
