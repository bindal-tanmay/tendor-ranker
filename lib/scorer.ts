import { CriterionScore } from './groq'

export interface VendorResult {
  vendorId: string
  vendorName: string
  totalScore: number
  maxScore: number
  percentage: number
  rank: number
  criteriaScores: CriterionScore[]
  strengths: string[]
  weaknesses: string[]
}

export function aggregateScores(
  vendorId: string,
  vendorName: string,
  criteriaScores: CriterionScore[]
): Omit<VendorResult, 'rank'> {
  const totalWeight = criteriaScores.reduce((sum, c) => sum + c.weight, 0)
  const weightedScore = criteriaScores.reduce(
    (sum, c) => sum + c.score * c.weight, 0
  )

  const maxScore = totalWeight * 10
  const totalScore = parseFloat((weightedScore / totalWeight).toFixed(2))
  const percentage = Math.round((weightedScore / maxScore) * 100)

  const strengths = criteriaScores
    .filter(c => c.score >= 7)
    .map(c => `${c.criterion}: ${c.rationale.split('.')[0]}`)

  const weaknesses = criteriaScores
    .filter(c => c.score < 5)
    .flatMap(c => c.gaps.length > 0
      ? c.gaps.map(g => `${c.criterion}: ${g}`)
      : [`${c.criterion}: scored ${c.score}/10`]
    )

  return {
    vendorId,
    vendorName,
    totalScore,
    maxScore,
    percentage,
    criteriaScores,
    strengths,
    weaknesses
  }
}

export function rankVendors(vendors: Omit<VendorResult, 'rank'>[]): VendorResult[] {
  return vendors
    .sort((a, b) => b.percentage - a.percentage)
    .map((v, i) => ({ ...v, rank: i + 1 }))
}