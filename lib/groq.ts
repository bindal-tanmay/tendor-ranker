import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export interface CriterionScore {
  criterion: string
  score: number        // 0-10
  rationale: string
  matchedText: string
  gaps: string[]
  weight: number
}

export async function extractCriteria(tenderText: string): Promise<string[]> {
  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are a tender evaluation expert. Extract the key evaluation criteria from tender documents. Respond ONLY with a JSON array of strings. No explanation, no markdown.'
      },
      {
        role: 'user',
        content: `Extract the main evaluation criteria from this tender document. Return as JSON array of strings only.\n\nTender:\n${tenderText.slice(0, 3000)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 500
  })

  const raw = response.choices[0].message.content || '[]'
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function scoreCriterion(
  criterion: string,
  vendorChunks: string[],
  vendorName: string
): Promise<CriterionScore> {
  const context = vendorChunks.join('\n\n---\n\n')

  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      {
        role: 'system',
        content: `You are a strict tender evaluation expert scoring vendor quotations. 
Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`
      },
      {
        role: 'user',
        content: `Score this vendor against the criterion below.

CRITERION: ${criterion}

VENDOR NAME: ${vendorName}

VENDOR SUBMISSION EXCERPTS:
${context}

Respond with this exact JSON format:
{
  "criterion": "${criterion}",
  "score": <0-10 integer>,
  "rationale": "<2 sentence explanation>",
  "matchedText": "<exact quote from vendor text that matches, or empty string>",
  "gaps": ["<gap 1>", "<gap 2>"],
  "weight": 1
}`
      }
    ],
    temperature: 0.1,
    max_tokens: 400
  })

  const raw = response.choices[0].message.content || '{}'
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}