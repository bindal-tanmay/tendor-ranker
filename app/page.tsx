'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from '@/components/UploadZone'

export default function Home() {
  const router = useRouter()
  const [tenderFile, setTenderFile] = useState<File | null>(null)
  const [vendorFiles, setVendorFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!tenderFile) { setError('Please upload a tender document'); return }
    if (vendorFiles.length < 2) { setError('Please upload at least 2 vendor quotations'); return }

    setLoading(true)
    setError('')

    try {
      // Step 1 — Ingest
      setStatus('Parsing and indexing documents...')
      const formData = new FormData()
      formData.append('tender', tenderFile)
      vendorFiles.forEach(f => formData.append('vendors', f))

      const ingestRes = await fetch('/api/ingest', { method: 'POST', body: formData })
      const ingestData = await ingestRes.json()
      if (!ingestRes.ok) throw new Error(ingestData.error)

      // Step 2 — Score
      setStatus(`Scoring ${ingestData.vendors.length} vendors against tender criteria...`)
      const scoreRes = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: ingestData.tenderId,
          vendors: ingestData.vendors
        })
      })
      const scoreData = await scoreRes.json()
      if (!scoreRes.ok) throw new Error(scoreData.error)

      // Store results and navigate
      sessionStorage.setItem('tenderResults', JSON.stringify(scoreData))
      router.push('/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Tender Quotation Ranker
          </h1>
          <p className="text-gray-400 text-lg">
            Upload a tender document and vendor quotations — get AI-powered rankings instantly
          </p>
        </div>

        {/* Upload tender */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tender Document
          </label>
          <UploadZone
            label="Drop tender document here"
            accept=".pdf,.docx,.txt"
            multiple={false}
            // onFiles={(files) => setTenderFile(files[0])}
            onFiles={(files: File[]) => setTenderFile(files[0])}
            selectedFiles={tenderFile ? [tenderFile] : []}
          />
        </div>

        {/* Upload vendors */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vendor Quotations <span className="text-gray-500">(upload 2 or more)</span>
          </label>
          <UploadZone
            label="Drop vendor quotations here"
            accept=".pdf,.docx,.txt"
            multiple={true}
            // onFiles={(files) => setVendorFiles(files)}
            onFiles={(files: File[]) => setVendorFiles(files)}
            selectedFiles={vendorFiles}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Status */}
        {loading && status && (
          <div className="mb-6 p-4 bg-blue-950 border border-blue-800 rounded-lg text-blue-300 text-sm flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            {status}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-white text-gray-950 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-lg"
        >
          {loading ? 'Processing...' : 'Analyse & Rank Vendors'}
        </button>

      </div>
    </main>
  )
}