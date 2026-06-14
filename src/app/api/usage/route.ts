import { NextResponse } from 'next/server'
import { parseUsageData } from '@/lib/session-parser'

export async function GET() {
  try {
    const data = parseUsageData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Usage data error:', err)
    return NextResponse.json({ error: 'Failed to read usage data.' }, { status: 500 })
  }
}
