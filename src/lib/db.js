import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,

  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },

  connectionTimeout: 15000,
  requestTimeout: 20000,

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 60000,
    acquireTimeoutMillis: 15000,
    createTimeoutMillis: 15000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 10000,
    createRetryIntervalMillis: 500,
  },
}

let pool = null
let poolPromise = null

async function resetPool() {
  const currentPool = pool

  pool = null
  poolPromise = null

  if (currentPool) {
    try {
      await currentPool.close()
      console.log('Database pool closed successfully')
    } catch (error) {
      console.error('Error closing database pool:', error.message || error)
    }
  }
}

export const connectToDatabase = async () => {
  try {
    if (pool && pool.connected) {
      try {
        const testRequest = pool.request()
        testRequest.timeout = 10000
        await testRequest.query('SELECT 1 AS ok')
        return pool
      } catch (testError) {
        console.error('Database test failed, recreating pool:', testError.message || testError)
        await resetPool()
      }
    }

    if (poolPromise) {
      return await poolPromise
    }

    console.log('Creating new connection pool...')

    const newPool = new sql.ConnectionPool(config)
    pool = newPool

    newPool.on('error', async (err) => {
      console.error('Database pool error:', err.message || err)
      await resetPool()
    })

    poolPromise = newPool.connect()
      .then(async (connectedPool) => {
        const testRequest = connectedPool.request()
        testRequest.timeout = 10000
        await testRequest.query('SELECT 1 AS ok')

        pool = connectedPool
        console.log('Database connection successful')
        return connectedPool
      })
      .catch(async (error) => {
        console.error('Database connection failed:', error.message || error)
        await resetPool()
        throw error
      })

    return await poolPromise
  } catch (error) {
    console.error('Database connection failed:', error.message || error)
    await resetPool()
    throw new Error('Database connection failed')
  }
}

export const closePool = async () => {
  await resetPool()
}

export { sql }
