import { NextRequest, NextResponse } from 'next/server'
import { extractCriteria, scoreCriterion } from '@/lib/groq'
import { searchChunks, searchTenderChunks } from '@/lib/qdrant'
import { embedText } from '@/lib/embedder'
import { aggregateScores, rankVendors } from '@/lib/scorer'

export async function POST(req: NextRequest) {
  try {
    const { tenderId, vendors } = await req.json()

    if (!tenderId || !vendors?.length) {
      return NextResponse.json({ error: 'tenderId and vendors required' }, { status: 400 })
    }

    // ── Step 1: Get tender text to extract criteria ──
    const tenderChunks = await searchTenderChunks(tenderId)
    const tenderText = tenderChunks.map((c: { text: string }) => c.text).join('\n\n')
    const criteria = await extractCriteria(tenderText)

    if (!criteria.length) {
      return NextResponse.json({ error: 'Could not extract criteria from tender' }, { status: 400 })
    }

    // ── Step 2: Score each vendor against each criterion ──
    const vendorResults = []

    for (const vendor of vendors) {
      const criteriaScores = []

      for (const criterion of criteria) {
        // Embed the criterion as a query
        const queryVector = await embedText(criterion)

        // Retrieve top matching chunks from this vendor
        const chunks = await searchChunks(queryVector, { vendorId: vendor.vendorId }, 3)
        const chunkTexts = chunks.map(c => c.text)

        // Score with Groq LLM
        const score = await scoreCriterion(criterion, chunkTexts, vendor.vendorName)
        criteriaScores.push(score)
      }

      const aggregated = aggregateScores(
        vendor.vendorId,
        vendor.vendorName,
        criteriaScores
      )
      vendorResults.push(aggregated)
    }

    // ── Step 3: Rank and return ──
    const ranked = rankVendors(vendorResults)

    return NextResponse.json({
      success: true,
      tenderId,
      criteria,
      results: ranked
    })

  } catch (err) {
    console.error('Score error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scoring failed' },
      { status: 500 }
    )
  }
}
