export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import {
  capturePayPalOrder,
  extractCompletedCaptureFromOrder
} from '@/lib/paypal'
import {
  creditCashShopOrder,
  failLocalOrder,
  getLocalOrderByPayPalId,
  getPool,
  validateCaptureMatchesOrder
} from '@/lib/cashshop-payments'

export async function POST(request) {
  let body = {}
  let paypalOrderId = ''

  try {
    body = await request.json()
    paypalOrderId = String(body?.paypalOrderId || body?.orderId || body?.token || '').trim()

    if (!paypalOrderId) {
      return NextResponse.json(
        { success: false, error: 'Order PayPal manquant.' },
        { status: 400 }
      )
    }

    const pool = await getPool()
    const localOrder = await getLocalOrderByPayPalId(pool, paypalOrderId)

    if (!localOrder) {
      return NextResponse.json(
        { success: false, error: 'Local order not found.' },
        { status: 404 }
      )
    }

    if (localOrder.credited) {
      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        message: 'This order was already credited.',
        characterName: localOrder.character_name,
        points: localOrder.points,
        pointsType: localOrder.points_type
      })
    }

    const captureData = await capturePayPalOrder(paypalOrderId)
    const capture = extractCompletedCaptureFromOrder(captureData)

    validateCaptureMatchesOrder(localOrder, capture)

    const credited = await creditCashShopOrder(pool, {
      paypalOrderId,
      capture
    })

    return NextResponse.json({
      success: true,
      alreadyCredited: Boolean(credited?.already_credited),
      message: credited?.already_credited
        ? 'Payment already credited.'
        : 'Payment confirmed. Points credited in-game.',
      characterName: credited?.character_name,
      points: credited?.points,
      pointsType: credited?.points_type
    })
  } catch (error) {
    console.error('[PAYPAL CAPTURE ERROR]', error)

    try {
      if (paypalOrderId) {
        const pool = await getPool()
        await failLocalOrder(pool, {
          paypalOrderId,
          reason: error.message || 'PayPal capture error'
        })
      }
    } catch (failError) {
      console.error('[PAYPAL CAPTURE FAIL ORDER ERROR]', failError)
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Could not confirm the PayPal payment.' },
      { status: 500 }
    )
  }
}
