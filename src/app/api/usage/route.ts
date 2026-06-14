import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseUsageData } from '@/lib/session-parser'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('claude_session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = parseUsageData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Usage data error:', err)
    return NextResponse.json(
      { error: 'Failed to read usage data.' },
      { status: 500 }
    )
  }
}
