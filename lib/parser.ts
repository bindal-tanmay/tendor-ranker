import mammoth from 'mammoth'

export interface ParsedDocument {
  text: string
  metadata: {
    filename: string
    pageCount?: number
    fileType: string
  }
}

export async function parseDocument(
  buffer: Buffer,
  filename: string
): Promise<ParsedDocument> {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') {
    return await parsePDF(buffer, filename)
  } else if (ext === 'docx' || ext === 'doc') {
    return await parseDOCX(buffer, filename)
  } else if (ext === 'txt') {
    return {
      text: buffer.toString('utf-8'),
      metadata: { filename, fileType: 'txt' }
    }
  } else {
    throw new Error(`Unsupported file type: ${ext}`)
  }
}

async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer)
  return {
    text: data.text,
    metadata: {
      filename,
      pageCount: data.numpages,
      fileType: 'pdf'
    }
  }
}

async function parseDOCX(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer })
  return {
    text: result.value,
    metadata: { filename, fileType: 'docx' }
  }
}