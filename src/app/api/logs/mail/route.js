import { NextResponse } from 'next/server'
import sql from 'mssql'
import { connectToDatabase } from '@/lib/db'

export async function GET(req) {
  let db;
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = (page - 1) * limit
    const senderSearch = searchParams.get('sender') || ''
    const receiverSearch = searchParams.get('receiver') || ''
    const itemSearch = searchParams.get('item') || ''
    
    // Get database connection
    db = await connectToDatabase()
    if (!db) {
      throw new Error('Failed to connect to database')
    }
    
    // Build the base query
    let baseQuery = `
      FROM [CHARACTER_01_DBF].[dbo].[MAIL_TBL] a
      LEFT JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL b ON a.idReceiver = b.m_idPlayer
      LEFT JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL c ON a.idSender = c.m_idPlayer
      WHERE 1=1
    `

    // Add search conditions
    let whereConditions = []
    if (senderSearch) {
      whereConditions.push(`LOWER(c.m_szName) LIKE LOWER(@senderSearch)`)
    }
    if (receiverSearch) {
      whereConditions.push(`LOWER(b.m_szName) LIKE LOWER(@receiverSearch)`)
    }
    if (itemSearch) {
      whereConditions.push(`CAST(a.dwItemId AS NVARCHAR(50)) LIKE @itemSearch`)
    }

    if (whereConditions.length > 0) {
      baseQuery += ` AND ${whereConditions.join(' AND ')}`
    }

    // Execute the main query with pagination
    const dbRequest = db.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)

    if (senderSearch) {
      dbRequest.input('senderSearch', sql.NVarChar, `%${senderSearch}%`)
    }
    if (receiverSearch) {
      dbRequest.input('receiverSearch', sql.NVarChar, `%${receiverSearch}%`)
    }
    if (itemSearch) {
      dbRequest.input('itemSearch', sql.NVarChar, `%${itemSearch}%`)
    }

    const result = await dbRequest.query(`
      SELECT
        b.m_szName AS Receiver,
        c.m_szName AS Sender,
        FORMAT(DATEADD(SECOND, a.tmCreate, '1970-01-01'), 'yyyy-MM-dd HH:mm:ss') AS CreatedAt,
        a.szTitle AS Title,
        a.szText AS Message,
        a.dwItemId AS ItemId,
        a.nItemNum AS ItemCount
      ${baseQuery}
      ORDER BY a.tmCreate DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `)

    // Get total count with the same conditions
    const countRequest = db.request()
    if (senderSearch) {
      countRequest.input('senderSearch', sql.NVarChar, `%${senderSearch}%`)
    }
    if (receiverSearch) {
      countRequest.input('receiverSearch', sql.NVarChar, `%${receiverSearch}%`)
    }
    if (itemSearch) {
      countRequest.input('itemSearch', sql.NVarChar, `%${itemSearch}%`)
    }

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      ${baseQuery}
    `)

    // Get today's mails count
    const todayResult = await db.request()
      .query(`
        SELECT COUNT(*) as today
        FROM [CHARACTER_01_DBF].[dbo].[MAIL_TBL]
        WHERE CAST(DATEADD(SECOND, tmCreate, '1970-01-01') AS DATE) = CAST(GETDATE() AS DATE)
      `)

    // Get active users (users who sent/received mail today)
    const activeUsersResult = await db.request()
      .query(`
        SELECT COUNT(DISTINCT p.m_idPlayer) as active
        FROM [CHARACTER_01_DBF].[dbo].[MAIL_TBL] m
        JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL p ON p.m_idPlayer IN (m.idSender, m.idReceiver)
        WHERE CAST(DATEADD(SECOND, m.tmCreate, '1970-01-01') AS DATE) = CAST(GETDATE() AS DATE)
      `)

    // Return the results with all stats
    return NextResponse.json({
      mails: result.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      },
      todayMails: todayResult.recordset[0].today,
      activeUsers: activeUsersResult.recordset[0].active
    })

  } catch (error) {
    console.error('Database error:', error)
    
    if (!error.code) {
      return NextResponse.json({ 
        error: error.message || 'An error occurred while fetching mail logs.'
      }, { status: 500 })
    }
    
    // Handle specific database errors
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 503 })
    }
    
    if (error.code === 'EREQUEST') {
      return NextResponse.json({ 
        error: 'Invalid database query. Please check your parameters.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'An error occurred while fetching mail logs.' 
    }, { status: 500 })
  }
} 