# tendor-ranker
# Tender Quotation Ranker

An AI-powered tender evaluation system that ingests tender documents and vendor quotations, scores vendors against tender criteria, and ranks them from best to worst — with per-criterion breakdowns, strengths, weaknesses, and evidence highlights.

Built for **BCGCL Project** as a production-ready RAG (Retrieval-Augmented Generation) application.

---

## Live Demo

🔗 [tendor-ranker.vercel.app](https://tendor-ranker.vercel.app)

---

## What It Does

1. **Upload** a tender document (PDF, DOCX, TXT) and multiple vendor quotations
2. **Parse & chunk** all documents into semantic segments
3. **Embed** chunks using HuggingFace `all-MiniLM-L6-v2` and store in Qdrant Cloud
4. **Extract criteria** from the tender document using Groq LLaMA3-70b
5. **Score** each vendor against each criterion via RAG retrieval + LLM scoring
6. **Rank** vendors best to worst with per-criterion scores, rationale, matched evidence, and gaps
7. **Export** a full evaluation report as a downloadable text file

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS) |
| API Routes | Next.js API Routes (serverless) |
| LLM | Groq API — LLaMA3-70b-8192 |
| Vector Database | Qdrant Cloud (free tier) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (inference API) |
| File Storage | Vercel Blob |
| Document Parsing | pdf-parse, mammoth |
| Deployment | Vercel |

---

## Project Structure

```
tender-ranker/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts       # Parse → chunk → embed → store in Qdrant
│   │   ├── score/route.ts        # Retrieve → score via Groq → rank vendors
│   │   ├── report/route.ts       # Fetch report data
│   │   └── export/route.ts       # Generate downloadable report
│   ├── dashboard/page.tsx        # Ranked results dashboard
│   ├── report/[id]/page.tsx      # Per-vendor detail page
│   └── page.tsx                  # Home / upload page
├── components/
│   ├── UploadZone.tsx            # Drag-and-drop file upload
│   ├── RankedTable.tsx           # Sorted vendor list
│   ├── VendorCard.tsx            # Expandable vendor card with scores
│   └── HighlightedDoc.tsx        # Document with keyword highlights
├── lib/
│   ├── parser.ts                 # PDF / DOCX / TXT extraction
│   ├── chunker.ts                # Sliding window semantic chunking
│   ├── embedder.ts               # HuggingFace embedding API calls
│   ├── qdrant.ts                 # Qdrant Cloud vector DB client
│   ├── groq.ts                   # Groq LLM — criteria extraction + scoring
│   └── scorer.ts                 # Weighted score aggregation + ranking
└── vercel.json                   # Vercel function config (60s timeout)
```

---

## RAG Pipeline

```
Tender Document          Vendor Quotations (N files)
      │                          │
      ▼                          ▼
  Doc Parser              Doc Parser (per vendor)
      │                          │
      ▼                          ▼
  Chunker                    Chunker
      │                          │
      ▼                          ▼
  Embedder ──────────────── Embedder
      │                          │
      └──────────┬───────────────┘
                 ▼
           Qdrant Cloud
           (Vector Store)
                 │
                 ▼
    Extract Criteria from Tender
    (Groq LLaMA3-70b)
                 │
                 ▼
    For each Vendor × each Criterion:
      → Embed criterion as query vector
      → Retrieve top-3 matching chunks from vendor
      → Score 0-10 with rationale via Groq
                 │
                 ▼
    Weighted Score Aggregation
                 │
                 ▼
    Ranked Output (best → worst)
```

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- Accounts on: [Groq](https://console.groq.com), [Qdrant Cloud](https://cloud.qdrant.io), [Vercel](https://vercel.com)

### Installation

```bash
git clone https://github.com/bindal-tanmay/tendor-ranker.git
cd tendor-ranker
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

This project is deployed on Vercel. Every `git push` to `main` triggers an automatic redeployment.

```bash
git add .
git commit -m "your message"
git push
```

Set the same environment variables in **Vercel → Settings → Environment Variables**.

---

## How to Use

1. Open the live URL
2. Upload your **tender document** (PDF, DOCX, or TXT)
3. Upload **2 or more vendor quotations** (PDF, DOCX, or TXT)
4. Click **Analyse & Rank Vendors**
5. Wait 30–60 seconds while the AI processes all documents
6. View the ranked results — click any vendor to see the full breakdown
7. Click **Export Report** to download a text summary

---

## Key Design Decisions

**Why Groq instead of Ollama?**
Ollama requires a persistent local process which is incompatible with Vercel's serverless functions. Groq provides the same open-source models (LLaMA3, Mixtral) via API with extremely fast inference.

**Why Qdrant Cloud instead of ChromaDB?**
ChromaDB requires a persistent server process. Qdrant Cloud is a managed vector database with a free tier that works perfectly with serverless deployments.

**Why criteria-anchored retrieval?**
Standard RAG retrieves chunks based on a user query. This system uses each tender criterion as a query vector, retrieving the most relevant vendor passages per criterion. This gives precise, structured scores rather than a generic similarity score.

---

## License

MIT — built for BCGCL Project client submission.
