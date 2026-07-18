import { NextRequest, NextResponse } from 'next/server'
import { parseDocument } from '@/lib/parser'
import { chunkText } from '@/lib/chunker'
import { embedBatch } from '@/lib/embedder'
import { upsertChunks } from '@/lib/qdrant'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const tenderFile = formData.get('tender') as File | null
    const vendorFiles = formData.getAll('vendors') as File[]
    const tenderId = `tender_${Date.now()}`

    if (!tenderFile) {
      return NextResponse.json({ error: 'No tender document provided' }, { status: 400 })
    }
    if (vendorFiles.length === 0) {
      return NextResponse.json({ error: 'No vendor quotations provided' }, { status: 400 })
    }

    // ── Parse & index tender document ──
    const tenderBuffer = Buffer.from(await tenderFile.arrayBuffer())
    const tenderParsed = await parseDocument(tenderBuffer, tenderFile.name)
    const tenderChunks = chunkText(tenderParsed.text, tenderFile.name, {
      isTender: true,
      chunkSize: 600,
      overlap: 100
    })

    // Upload tender to blob storage
    await put(`${tenderId}/${tenderFile.name}`, tenderBuffer, { access: 'public' })

    // Embed and store tender chunks
    const tenderTexts = tenderChunks.map(c => c.text)
    const tenderVectors = await embedBatch(tenderTexts)
    await upsertChunks(tenderChunks.map((chunk, i) => ({
      id: `${tenderId}_chunk_${i}`,
      vector: tenderVectors[i],
      text: chunk.text,
      metadata: { ...chunk.metadata, tenderId, isTender: true }
    })))

    // ── Parse & index each vendor ──
    const vendors = []
    for (const file of vendorFiles) {
      const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const vendorName = file.name.replace(/\.[^/.]+$/, '')
      const buffer = Buffer.from(await file.arrayBuffer())
      const parsed = await parseDocument(buffer, file.name)

      const chunks = chunkText(parsed.text, file.name, {
        vendorId,
        isTender: false,
        chunkSize: 500,
        overlap: 100
      })

      // Upload to blob
      await put(`${tenderId}/vendors/${vendorId}/${file.name}`, buffer, { access: 'public' })

      // Embed and store
      const texts = chunks.map(c => c.text)
      const vectors = await embedBatch(texts)
      await upsertChunks(chunks.map((chunk, i) => ({
        id: `${vendorId}_chunk_${i}`,
        vector: vectors[i],
        text: chunk.text,
        metadata: { ...chunk.metadata, tenderId, vendorId, vendorName }
      })))

      vendors.push({ vendorId, vendorName, chunkCount: chunks.length })
    }

    return NextResponse.json({
      success: true,
      tenderId,
      tenderChunks: tenderChunks.length,
      vendors
    })

  } catch (err) {
    console.error('Ingest error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ingest failed' },
      { status: 500 }
    )
  }
}