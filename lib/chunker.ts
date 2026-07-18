export interface Chunk {
  text: string
  index: number
  metadata: {
    filename: string
    vendorId?: string
    isTender?: boolean
    startChar: number
    endChar: number
  }
}

export function chunkText(
  text: string,
  filename: string,
  options: {
    chunkSize?: number
    overlap?: number
    vendorId?: string
    isTender?: boolean
  } = {}
): Chunk[] {
  const {
    chunkSize = 500,
    overlap = 100,
    vendorId,
    isTender = false
  } = options

  const chunks: Chunk[] = []
  const sentences = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)

  let current = ''
  let startChar = 0
  let index = 0

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
      chunks.push({
        text: current.trim(),
        index,
        metadata: {
          filename,
          vendorId,
          isTender,
          startChar,
          endChar: startChar + current.length
        }
      })

      // overlap — keep last N chars as context for next chunk
      const overlapText = current.slice(-overlap)
      startChar = startChar + current.length - overlap
      current = overlapText + ' ' + sentence
      index++
    } else {
      current = current ? current + ' ' + sentence : sentence
    }
  }

  if (current.trim()) {
    chunks.push({
      text: current.trim(),
      index,
      metadata: {
        filename,
        vendorId,
        isTender,
        startChar,
        endChar: startChar + current.length
      }
    })
  }

  return chunks
}