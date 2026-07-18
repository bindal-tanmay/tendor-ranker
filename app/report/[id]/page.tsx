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
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-8">
          Back to rankings
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{vendor.vendorName}</h1>
          <p className="text-gray-400 mt-1">Rank {vendor.rank} - {vendor.percentage}% match</p>
        </div>
        <div className="space-y-4">
          {vendor.criteriaScores.map((c, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{c.criterion}</h3>
                <span className={c.score >= 7 ? 'text-green-400 font-bold' : c.score >= 5 ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
                  {c.score}/10
                </span>
              </div>
              <p className="text-sm text-gray-400">{c.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}