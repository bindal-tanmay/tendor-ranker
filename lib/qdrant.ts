// import { QdrantClient } from '@qdrant/js-client-rest'

// const client = new QdrantClient({
//   url: process.env.QDRANT_URL!,
//   apiKey: process.env.QDRANT_API_KEY!,
// })

// const COLLECTION = 'tender_chunks'
// const VECTOR_SIZE = 384

// export async function ensureCollection() {
//   try {
//     await client.getCollection(COLLECTION)
//   } catch {
//     await client.createCollection(COLLECTION, {
//       vectors: { size: VECTOR_SIZE, distance: 'Cosine' }
//     })
//   }
// }

// export async function upsertChunks(
//   chunks: Array<{
//     id: string
//     vector: number[]
//     text: string
//     metadata: Record<string, unknown>
//   }>
// ) {
//   await ensureCollection()
//   await client.upsert(COLLECTION, {
//     wait: true,
//     points: chunks.map((chunk, i) => ({
//       id: i + Date.now(),
//       vector: chunk.vector,
//       payload: { text: chunk.text, ...chunk.metadata }
//     }))
//   })
// }

// export async function searchChunks(
//   vector: number[],
//   filter: Record<string, string>,
//   topK = 3
// ) {
//   const results = await client.search(COLLECTION, {
//     vector,
//     limit: topK,
//     filter: {
//       must: Object.entries(filter).map(([key, value]) => ({
//         key,
//         match: { value }
//       }))
//     },
//     with_payload: true
//   })

//   return results.map(r => ({
//     text: r.payload?.text as string,
//     score: r.score,
//     metadata: r.payload
//   }))
// }

// export async function deleteByVendor(vendorId: string) {
//   await client.delete(COLLECTION, {
//     wait: true,
//     filter: {
//       must: [{ key: 'vendorId', match: { value: vendorId } }]
//     }
//   })
// }

// export async function searchTenderChunks(tenderId: string) {
//   const results = await client.scroll(COLLECTION, {
//     filter: {
//       must: [
//         { key: 'tenderId', match: { value: tenderId } },
//         { key: 'isTender', match: { value: true } }
//       ]
//     },
//     with_payload: true,
//     limit: 50
//   })

//   return (results.points || []).map((p: { payload?: Record<string, unknown> }) => ({
//     text: p.payload?.text as string,
//     metadata: p.payload
//   }))
// }

import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
})

const COLLECTION = 'tender_chunks'
const VECTOR_SIZE = 384

export async function ensureCollection() {
  try {
    await client.getCollection(COLLECTION)
  } catch {
    await client.createCollection(COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' }
    })
  }
}

export async function upsertChunks(
  chunks: Array<{
    id: string
    vector: number[]
    text: string
    metadata: Record<string, unknown>
  }>
) {
  await ensureCollection()
  await client.upsert(COLLECTION, {
    wait: true,
    points: chunks.map((chunk, i) => ({
      id: i + Date.now(),
      vector: chunk.vector,
      payload: { text: chunk.text, ...chunk.metadata }
    }))
  })
}

export async function searchChunks(
  vector: number[],
  filter: Record<string, string>,
  topK = 3
) {
  const results = await client.search(COLLECTION, {
    vector,
    limit: topK,
    filter: {
      must: Object.entries(filter).map(([key, value]) => ({
        key,
        match: { value }
      }))
    },
    with_payload: true
  })

  return results.map(r => ({
    text: r.payload?.text as string,
    score: r.score,
    metadata: r.payload
  }))
}

export async function deleteByVendor(vendorId: string) {
  await client.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [{ key: 'vendorId', match: { value: vendorId } }]
    }
  })
}

export async function searchTenderChunks(tenderId: string) {
  const results = await client.scroll(COLLECTION, {
    filter: {
      must: [
        { key: 'tenderId', match: { value: tenderId } },
        { key: 'isTender', match: { value: true } }
      ]
    },
    with_payload: true,
    limit: 50
  })

return (results.points || []).map((p) => ({
  text: (p.payload?.text ?? '') as string,
  metadata: p.payload as Record<string, unknown> | undefined
}))
}