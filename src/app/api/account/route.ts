import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseAccountInfo } from '@/lib/session-parser'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('claude_session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = parseAccountInfo()

    // Build a preview of the API key (show first 10 + last 4 chars)
    const key = session.value
    let apiKeyPreview = ''
    if (key && key.length > 14) {
      apiKeyPreview = key.slice(0, 10) + '...' + key.slice(-4)
    } else if (key) {
      apiKeyPreview = key.slice(0, 4) + '...'
    }

    return NextResponse.json({ ...data, apiKeyPreview })
  } catch (err) {
    console.error('Account data error:', err)
    return NextResponse.json(
      { error: 'Failed to read account data.' },
      { status: 500 }
    )
  }
}
