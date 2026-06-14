import { NextResponse } from 'next/server'
import { parseAccountInfo } from '@/lib/session-parser'

export async function GET() {
  try {
    const data = parseAccountInfo()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Account data error:', err)
    return NextResponse.json({ error: 'Failed to read account data.' }, { status: 500 })
  }
}
