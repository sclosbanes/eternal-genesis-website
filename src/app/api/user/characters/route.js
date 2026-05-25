import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/characters`, {
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Could not retrieve characters')
    }

    return NextResponse.json({ characters: data.characters })
  } catch (error) {
    console.error('Error while retrieving characters:', error)
    return NextResponse.json(
      { error: 'Could not retrieve characters' },
      { status: 500 }
    )
  }
}