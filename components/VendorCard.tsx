'use client'

import { VendorResult } from '@/lib/scorer'

export interface Props {
  vendor: VendorResult
  isExpanded: boolean
  onToggle: () => void
}

const rankColors: Record<number, string> = {
  1: 'bg-yellow-500 text-yellow-950',
  2: 'bg-gray-400 text-gray-950',
  3: 'bg-orange-600 text-orange-950',
}

function scoreColor(pct: number) {
  if (pct >= 70) return 'bg-green-500'
  if (pct >= 45) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function VendorCard({ vendor, isExpanded, onToggle }: Props) {
  const badgeCls = rankColors[vendor.rank] || 'bg-gray-700 text-gray-300'

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">

      {/* Header row */}
      <div
        onClick={onToggle}
        className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-gray-800 transition-all"
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeCls}`}>
          #{vendor.rank}
        </span>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{vendor.vendorName}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {vendor.criteriaScores.length} criteria evaluated
          </div>
        </div>

        {/* Score bar */}
        <div className="w-36 hidden sm:block">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Match</span>
            <span className="text-white font-medium">{vendor.percentage}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreColor(vendor.percentage)}`}
              style={{ width: `${vendor.percentage}%` }}
            />
          </div>
        </div>

        <span className="text-gray-600 text-lg ml-2">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-6 py-6 space-y-6">

          {/* Strengths & weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-950 border border-green-900 rounded-lg p-4">
              <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
                ✓ Strengths
              </div>
              {vendor.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {vendor.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-200">{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-700">None identified</p>
              )}
            </div>

            <div className="bg-red-950 border border-red-900 rounded-lg p-4">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                ✗ Weaknesses
              </div>
              {vendor.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {vendor.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-200">{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-700">None identified</p>
              )}
            </div>
          </div>

          {/* Per-criterion breakdown */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Criteria Breakdown
            </div>
            <div className="space-y-3">
              {vendor.criteriaScores.map((c, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{c.criterion}</span>
                    <span className={`text-sm font-bold ${c.score >= 7 ? 'text-green-400' : c.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {c.score}/10
                    </span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full mb-3">
                    <div
                      className={`h-full rounded-full ${scoreColor(c.score * 10)}`}
                      style={{ width: `${c.score * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{c.rationale}</p>
                  {c.matchedText && (
                    <p className="text-xs text-blue-400 mt-2 italic">
                      &ldquo;{c.matchedText}&rdquo;
                    </p>
                  )}
                  {c.gaps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.gaps.map((g, j) => (
                        <span key={j} className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}