export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Ancienne route PayPal.me desactivee. Utilise /api/paypal/create-order avec itemId et characterName.'
    },
    { status: 410 }
  )
}
