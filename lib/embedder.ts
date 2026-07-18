const EMBEDDING_API = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2'

export async function embedText(text: string): Promise<number[]> {
  const response = await fetch(EMBEDDING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
  })

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`)
  }

  const data = await response.json()
  // HuggingFace returns nested array for batches, flat for single
  return Array.isArray(data[0]) ? data[0] : data
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch(EMBEDDING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } })
  })

  if (!response.ok) {
    throw new Error(`Embedding batch API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}