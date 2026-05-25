import { connectToDatabase } from '@/lib/db'

const VALID_POINT_TYPES = new Set(['donate', 'vote'])

export function normalizeText(value, maxLength = 255) {
  return String(value || '').trim().slice(0, maxLength)
}

export function normalizeCharacterName(value) {
  return normalizeText(value, 32)
}

export function getRequestBaseUrl(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || process.env.SITE_URL

  if (configured && String(configured).trim()) {
    return String(configured).trim().replace(/\/$/, '')
  }

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'

  if (!host) {
    throw new Error('Could not determine the site URL')
  }

  return `${proto}://${host}`
}

export async function getPool() {
  return connectToDatabase()
}

export async function getTopupItem(pool, itemId) {
  const id = Number(itemId)

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Shop pack invalide')
  }

  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT TOP 1
        id,
        name,
        description,
        CAST(price AS DECIMAL(18, 2)) AS price,
        points,
        LOWER(ISNULL(points_type, CASE WHEN category = 'vote' THEN 'vote' ELSE 'donate' END)) AS points_type,
        category,
        is_on_sale,
        sale_percentage
      FROM [WEBSITE_DBF].[dbo].[topup_items]
      WHERE id = @id
    `)

  const item = result.recordset[0]

  if (!item) {
    throw new Error('Shop pack not found')
  }

  const price = Number(item.price)
  const points = Number(item.points)
  const pointsType = String(item.points_type || '').toLowerCase()

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Prix du pack invalide')
  }

  if (!Number.isInteger(points) || points <= 0) {
    throw new Error('Invalid point amount')
  }

  if (!VALID_POINT_TYPES.has(pointsType)) {
    throw new Error('Type de points invalide')
  }

  return {
    id: Number(item.id),
    name: normalizeText(item.name, 255),
    description: normalizeText(item.description || '', 1000),
    price,
    points,
    pointsType,
    category: normalizeText(item.category || pointsType, 50)
  }
}

export async function resolveCharacter(pool, characterName) {
  const name = normalizeCharacterName(characterName)

  if (!name || name.length < 2) {
    throw new Error('Character name invalide')
  }

  const result = await pool.request()
    .input('characterName', name)
    .query(`
      SELECT TOP 1
        c.m_idPlayer,
        c.account,
        c.m_szName,
        a.account AS account_exists
      FROM [CHARACTER_01_DBF].[dbo].[CHARACTER_TBL] c
      INNER JOIN [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL] a
        ON a.account = c.account
      WHERE LTRIM(RTRIM(c.m_szName)) = @characterName
      ORDER BY c.m_idPlayer DESC
    `)

  const character = result.recordset[0]

  if (!character) {
    throw new Error('Character not found. Check the exact character name.')
  }

  return {
    idPlayer: Number(character.m_idPlayer),
    account: normalizeText(character.account, 50),
    name: normalizeCharacterName(character.m_szName)
  }
}

export async function createLocalOrder(pool, { item, character, amount, currency }) {
  const result = await pool.request()
    .input('websiteUserEmail', null)
    .input('characterName', character.name)
    .input('characterId', character.idPlayer)
    .input('flyffAccount', character.account)
    .input('itemId', item.id)
    .input('itemName', item.name)
    .input('points', item.points)
    .input('pointsType', item.pointsType)
    .input('amount', amount)
    .input('currency', currency)
    .query(`
      INSERT INTO [WEBSITE_DBF].[dbo].[paypal_cashshop_orders] (
        website_user_email,
        character_name,
        character_id,
        flyff_account,
        item_id,
        item_name,
        points,
        points_type,
        amount,
        currency,
        status,
        credited,
        created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @websiteUserEmail,
        @characterName,
        @characterId,
        @flyffAccount,
        @itemId,
        @itemName,
        @points,
        @pointsType,
        @amount,
        @currency,
        'created',
        0,
        GETDATE()
      )
    `)

  return Number(result.recordset[0].id)
}

export async function attachPayPalOrder(pool, { localOrderId, paypalOrderId, paypalRaw }) {
  await pool.request()
    .input('id', localOrderId)
    .input('paypalOrderId', paypalOrderId)
    .input('paypalRaw', JSON.stringify(paypalRaw || {}))
    .query(`
      UPDATE [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
      SET
        paypal_order_id = @paypalOrderId,
        paypal_create_payload = @paypalRaw,
        status = 'paypal_created',
        updated_at = GETDATE()
      WHERE id = @id
        AND credited = 0
    `)
}

export async function failLocalOrder(pool, { paypalOrderId, localOrderId, reason }) {
  await pool.request()
    .input('paypalOrderId', paypalOrderId || null)
    .input('localOrderId', localOrderId || null)
    .input('reason', normalizeText(reason, 1000))
    .query(`
      UPDATE [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
      SET
        status = 'failed',
        failure_reason = @reason,
        updated_at = GETDATE()
      WHERE
        (@paypalOrderId IS NOT NULL AND paypal_order_id = @paypalOrderId)
        OR (@localOrderId IS NOT NULL AND id = @localOrderId)
    `)
}

export async function getLocalOrderByPayPalId(pool, paypalOrderId) {
  const id = normalizeText(paypalOrderId, 100)

  if (!id) {
    throw new Error('Order PayPal manquant')
  }

  const result = await pool.request()
    .input('paypalOrderId', id)
    .query(`
      SELECT TOP 1
        id,
        paypal_order_id,
        paypal_capture_id,
        character_name,
        character_id,
        flyff_account,
        item_id,
        item_name,
        points,
        points_type,
        CAST(amount AS DECIMAL(18, 2)) AS amount,
        currency,
        status,
        credited
      FROM [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
      WHERE paypal_order_id = @paypalOrderId
    `)

  return result.recordset[0] || null
}

export function validateCaptureMatchesOrder(order, capture) {
  if (!order) {
    throw new Error('Local order not found')
  }

  if (!capture || capture.status !== 'COMPLETED') {
    throw new Error('PayPal payment non complete')
  }

  const expectedAmount = Number(order.amount)
  const paidAmount = Number(capture.amount)
  const expectedCurrency = String(order.currency || '').toUpperCase()
  const paidCurrency = String(capture.currency || '').toUpperCase()

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error('Montant paye invalide')
  }

  if (Math.abs(expectedAmount - paidAmount) > 0.001) {
    throw new Error(`Montant PayPal incorrect: attendu ${expectedAmount}, recu ${paidAmount}`)
  }

  if (expectedCurrency !== paidCurrency) {
    throw new Error(`Devise PayPal incorrecte: attendu ${expectedCurrency}, recu ${paidCurrency}`)
  }
}

export async function creditCashShopOrder(pool, { paypalOrderId, capture }) {
  const rawPayload = JSON.stringify(capture.raw || {})

  const result = await pool.request()
    .input('paypalOrderId', paypalOrderId)
    .input('captureId', capture.id)
    .input('payerEmail', capture.payerEmail || null)
    .input('rawPayload', rawPayload)
    .query(`
      SET XACT_ABORT ON;

      BEGIN TRY
        BEGIN TRAN;

        DECLARE @orderId INT;
        DECLARE @account NVARCHAR(50);
        DECLARE @points INT;
        DECLARE @pointsType NVARCHAR(20);
        DECLARE @alreadyCredited BIT;

        SELECT TOP 1
          @orderId = id,
          @account = flyff_account,
          @points = points,
          @pointsType = points_type,
          @alreadyCredited = credited
        FROM [WEBSITE_DBF].[dbo].[paypal_cashshop_orders] WITH (UPDLOCK, HOLDLOCK)
        WHERE paypal_order_id = @paypalOrderId;

        IF @orderId IS NULL
          THROW 51000, 'Local PayPal order not found.', 1;

        IF @alreadyCredited = 1
        BEGIN
          COMMIT TRAN;

          SELECT
            CAST(1 AS BIT) AS success,
            CAST(1 AS BIT) AS already_credited,
            id,
            character_name,
            flyff_account,
            points,
            points_type,
            status
          FROM [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
          WHERE id = @orderId;

          RETURN;
        END

        IF @pointsType = 'donate'
        BEGIN
          UPDATE [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL]
          SET cash = ISNULL(cash, 0) + @points
          WHERE account = @account;
        END
        ELSE IF @pointsType = 'vote'
        BEGIN
          UPDATE [ACCOUNT_DBF].[dbo].[ACCOUNT_TBL]
          SET votepoint = ISNULL(votepoint, 0) + @points
          WHERE account = @account;
        END
        ELSE
        BEGIN
          THROW 51001, 'Type de points invalide.', 1;
        END

        IF @@ROWCOUNT = 0
          THROW 51002, 'FlyFF account not found while crediting points.', 1;

        UPDATE [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
        SET
          paypal_capture_id = @captureId,
          paypal_payer_email = @payerEmail,
          paypal_capture_payload = @rawPayload,
          status = 'completed',
          credited = 1,
          paid_at = ISNULL(paid_at, GETDATE()),
          credited_at = GETDATE(),
          updated_at = GETDATE()
        WHERE id = @orderId;

        COMMIT TRAN;

        SELECT
          CAST(1 AS BIT) AS success,
          CAST(0 AS BIT) AS already_credited,
          id,
          character_name,
          flyff_account,
          points,
          points_type,
          status
        FROM [WEBSITE_DBF].[dbo].[paypal_cashshop_orders]
        WHERE id = @orderId;
      END TRY
      BEGIN CATCH
        IF @@TRANCOUNT > 0
          ROLLBACK TRAN;

        THROW;
      END CATCH
    `)

  return result.recordset[0]
}
