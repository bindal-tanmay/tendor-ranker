import { NextRequest, NextResponse } from 'next/server'
import { VendorResult } from '@/lib/scorer'

export async function POST(req: NextRequest) {
  try {
    const { results, tenderId } = await req.json() as {
      results: VendorResult[]
      tenderId: string
    }

    // Build a plain text report (CSV-style for client download)
    const lines = [
      `TENDER EVALUATION REPORT`,
      `Tender ID: ${tenderId}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `RANKING SUMMARY`,
      `Rank,Vendor,Score,Percentage`,
      ...results.map(r =>
        `${r.rank},${r.vendorName},${r.totalScore}/10,${r.percentage}%`
      ),
      ``,
      `DETAILED BREAKDOWN`,
    ]

    for (const vendor of results) {
      lines.push(``)
      lines.push(`#${vendor.rank} — ${vendor.vendorName} (${vendor.percentage}%)`)
      lines.push(`Strengths:`)
      vendor.strengths.forEach(s => lines.push(`  + ${s}`))
      lines.push(`Weaknesses:`)
      vendor.weaknesses.forEach(w => lines.push(`  - ${w}`))
      lines.push(`Criteria Scores:`)
      vendor.criteriaScores.forEach(c =>
        lines.push(`  [${c.score}/10] ${c.criterion} — ${c.rationale}`)
      )
    }

    const reportText = lines.join('\n')

    return new NextResponse(reportText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="tender-report-${tenderId}.txt"`
      }
    })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export failed' },
      { status: 500 }
    )
  }
}