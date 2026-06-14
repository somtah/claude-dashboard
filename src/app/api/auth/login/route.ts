import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'API key is required.' },
        { status: 400 }
      )
    }

    // Verify the API key against Anthropic
    const verifyRes = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    })

    if (!verifyRes.ok) {
      if (verifyRes.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key. Please check and try again.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { success: false, error: `API verification failed (status ${verifyRes.status}).` },
        { status: 400 }
      )
    }

    // Store the API key in an httpOnly cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('claude_session', apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
