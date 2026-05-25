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
    const playerSearch = searchParams.get('player') || ''
    const itemSearch = searchParams.get('item') || ''
    
    // Get database connection
    db = await connectToDatabase()
    if (!db) {
      throw new Error('Failed to connect to database')
    }
    
    // Build the base query
    let baseQuery = `
      FROM [LOGGING_01_DBF].[dbo].[tblTradeLog] t
      LEFT JOIN [LOGGING_01_DBF].[dbo].[tblTradeDetailLog] td1 ON t.TradeID = td1.TradeID
      LEFT JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL p1 ON p1.m_idPlayer = td1.idPlayer
      LEFT JOIN [LOGGING_01_DBF].[dbo].[tblTradeDetailLog] td2 ON t.TradeID = td2.TradeID AND td2.idPlayer <> td1.idPlayer
      LEFT JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL p2 ON p2.m_idPlayer = td2.idPlayer
      OUTER APPLY (
        SELECT STRING_AGG(CONCAT('Item(', a.ItemIndex, ') x', a.ItemCnt), CHAR(10)) AS ItemList
        FROM [LOGGING_01_DBF].[dbo].[tblTradeItemLog] a
        WHERE a.TradeID = t.TradeID AND a.idPlayer = td1.idPlayer
      ) i1
      OUTER APPLY (
        SELECT STRING_AGG(CONCAT('Item(', a.ItemIndex, ') x', a.ItemCnt), CHAR(10)) AS ItemList
        FROM [LOGGING_01_DBF].[dbo].[tblTradeItemLog] a
        WHERE a.TradeID = t.TradeID AND a.idPlayer = td2.idPlayer
      ) i2
      WHERE t.TradeID IS NOT NULL
    `

    // Add search conditions
    let whereConditions = []
    if (playerSearch) {
      console.log('Adding player search condition:', playerSearch)
      whereConditions.push(`(LOWER(p1.m_szName) LIKE LOWER(@playerSearch) OR LOWER(p2.m_szName) LIKE LOWER(@playerSearch))`)
    }
    if (itemSearch) {
      console.log('Adding item search condition:', itemSearch)
      whereConditions.push(`(LOWER(i1.ItemList) LIKE LOWER(@itemSearch) OR LOWER(i2.ItemList) LIKE LOWER(@itemSearch))`)
    }

    if (whereConditions.length > 0) {
      baseQuery += ` AND ${whereConditions.join(' AND ')}`
    }
    
    console.log('Final query conditions:', whereConditions)

    // Execute the main query with pagination
    const dbRequest = db.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)

    if (playerSearch) {
      dbRequest.input('playerSearch', sql.NVarChar, `%${playerSearch}%`)
    }
    if (itemSearch) {
      dbRequest.input('itemSearch', sql.NVarChar, `%${itemSearch}%`)
    }

    const result = await dbRequest.query(`
      SELECT
        t.TradeID,
        CONVERT(VARCHAR, t.TradeDt, 120) AS TradeDt,
        p1.m_szName AS Player1,
        p2.m_szName AS Player2,
        ISNULL(i1.ItemList, '') AS ItemsFromPlayer1,
        ISNULL(i2.ItemList, '') AS ItemsFromPlayer2
      ${baseQuery}
      ORDER BY t.TradeDt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `)

    // Get total count with the same conditions
    const countRequest = db.request()
    if (playerSearch) {
      countRequest.input('playerSearch', sql.NVarChar, `%${playerSearch}%`)
    }
    if (itemSearch) {
      countRequest.input('itemSearch', sql.NVarChar, `%${itemSearch}%`)
    }

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      ${baseQuery}
    `)

    // Get today's trades count
    const todayResult = await db.request()
      .query(`
        SELECT COUNT(*) as today
        FROM [LOGGING_01_DBF].[dbo].[tblTradeLog]
        WHERE CAST(TradeDt AS DATE) = CAST(GETDATE() AS DATE)
      `)

    // Get active players (players who traded today)
    const activePlayersResult = await db.request()
      .query(`
        SELECT COUNT(DISTINCT p.m_idPlayer) as active
        FROM [LOGGING_01_DBF].[dbo].[tblTradeLog] t
        JOIN [LOGGING_01_DBF].[dbo].[tblTradeDetailLog] td ON t.TradeID = td.TradeID
        JOIN CHARACTER_01_DBF.dbo.CHARACTER_TBL p ON p.m_idPlayer = td.idPlayer
        WHERE CAST(t.TradeDt AS DATE) = CAST(GETDATE() AS DATE)
      `)

    // Return the results with all stats
    return NextResponse.json({
      trades: result.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      },
      todayTrades: todayResult.recordset[0].today,
      activePlayers: activePlayersResult.recordset[0].active
    })

  } catch (error) {
    console.error('Database error:', error)
    
    if (!error.code) {
      return NextResponse.json({ 
        error: error.message || 'An error occurred while fetching trade logs.'
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
      error: 'An error occurred while fetching trade logs.' 
    }, { status: 500 })
  }
} 