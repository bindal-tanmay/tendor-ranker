import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tenderId = searchParams.get('tenderId')

    if (!tenderId) {
      return NextResponse.json({ error: 'tenderId required' }, { status: 400 })
    }

    // In a full implementation this would fetch from a DB
    // For now return the tenderId so frontend can pair with scored results
    return NextResponse.json({
      success: true,
      tenderId,
      message: 'Use /api/score results stored in frontend state'
    })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Report fetch failed' },
      { status: 500 }
    )
  }
}