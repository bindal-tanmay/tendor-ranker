'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { VendorResult } from '@/lib/scorer'

interface TenderResults {
  tenderId: string
  criteria: string[]
  results: VendorResult[]
}

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string
  const [vendor, setVendor] = useState<VendorResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('tenderResults')
    if (!stored) { router.push('/'); return }
    const data: TenderResults = JSON.parse(stored)
    const found = data.results.find(v => v.vendorId === vendorId)
    if (!found) { router.push('/dashboard'); return }
    setVendor(found)
  }, [vendorId, router])

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white text-sm mb-8 flex items-center gap-2"
        >
          ← Back to rankings
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{vendor.vendorName}</h1>
          <p className="text-gray-400 mt-1">
            Rank #{vendor.rank} · {vendor.percentage}% match
          </p>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{vendor.percentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Overall Match</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">#{vendor.rank}</div>
            <div className="text-xs text-gray-500 mt-1">Ranking</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{vendor.criteriaScores.length}</div>
            <div className="text-xs text-gray-500 mt-1">Criteria Scored</div>
          </div>
        </div>

        {/* Criteria breakdown */}
        <div className="space-y-4">
          {vendor.criteriaScores.map((c, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{c.criterion}</h3>
                <span className={`text-lg font-bold ${c.score >= 7 ? 'text-green-400' : c.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {c.score}/10
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full mb-3">
                <div
                  className={`h-full rounded-full ${c.score >= 7 ? 'bg-green-500' : c.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${c.score * 10}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mb-2">{c.rationale}</p>
              {c.matchedText && (
                <p className="text-xs text-blue-400 italic mb-2">&ldquo;{c.matchedText}&rdquo;</p>
              )}
              {c.gaps.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.gaps.map((g, j) => (
                    <span key={j} className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}