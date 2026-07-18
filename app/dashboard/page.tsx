'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RankedTable from '@/components/RankedTable'
import { VendorResult } from '@/lib/scorer'

interface TenderResults {
  tenderId: string
  criteria: string[]
  results: VendorResult[]
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<TenderResults | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('tenderResults')
    if (!stored) { router.push('/'); return }
    setData(JSON.parse(stored))
  }, [router])

  async function handleExport() {
    if (!data) return
    setExporting(true)
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: data.results, tenderId: data.tenderId })
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tender-report-${data.tenderId}.txt`
    a.click()
    setExporting(false)
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Evaluation Results</h1>
            <p className="text-gray-400 mt-1">
              {data.results.length} vendors ranked across {data.criteria.length} criteria
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-gray-900 transition-all"
            >
              New Analysis
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-white text-gray-950 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40 transition-all"
            >
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* Criteria used */}
        <div className="mb-8 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Criteria extracted from tender</p>
          <div className="flex flex-wrap gap-2">
            {data.criteria.map((c, i) => (
              <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Ranked table */}
        <RankedTable results={data.results} tenderId={data.tenderId} />

      </div>
    </main>
  )
}