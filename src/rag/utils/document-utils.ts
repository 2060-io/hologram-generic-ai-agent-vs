import { promises as fs } from 'fs'
import * as path from 'path'
import axios from 'axios'
import { parse as csvParse, Options as CsvParseOptions } from 'csv-parse/sync'
import type pdfParse from 'pdf-parse'
import { createHash } from 'crypto'
import { Logger } from '@nestjs/common'

/**
 * Ensure a unique ID within the given set, appending a numeric suffix if needed.
 */
export function ensureUniqueId(usedIds: Set<string>, base: string) {
  if (!usedIds.has(base)) {
    usedIds.add(base)
    return base
  }
  let i = 2
  while (usedIds.has(`${base}#${i}`)) i++
  const id = `${base}#${i}`
  usedIds.add(id)
  return id
}

/**
 * Load a local document from disk and return normalized text content.
 * Supports .txt, .md, .pdf, .csv. Returns null for unsupported types.
 */
export async function loadLocalDocument(
  filePath: string,
  fileName: string,
  options: CsvParseOptions,
  usedIds: Set<string>,
  logger?: Logger,
): Promise<{ id: string; content: string } | null> {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.txt' || ext === '.md') {
    const content = await fs.readFile(filePath, 'utf-8')
    const id = ensureUniqueId(usedIds, fileName)
    logger?.log?.(`[RAG] Loaded ${ext.toUpperCase()} document "${fileName}"`)
    return { id, content }
  } else if (ext === '.pdf') {
    const dataBuffer = await fs.readFile(filePath)
    // Dynamic import to support both CJS and ESM versions of pdf-parse
    const mod = (await import('pdf-parse')) as { default: typeof pdfParse } | typeof pdfParse
    const parsePdf: typeof pdfParse =
      typeof mod === 'function' ? (mod as typeof pdfParse) : (mod as { default: typeof pdfParse }).default
    const pdfData = await parsePdf(dataBuffer)
    const id = ensureUniqueId(usedIds, fileName)
    logger?.log?.(`[RAG] Loaded PDF document "${fileName}"`)
    return { id, content: pdfData.text }
  } else if (ext === '.csv') {
    const csvContent = await fs.readFile(filePath, 'utf-8')
    const rows: string[][] = csvParse(csvContent, options) as string[][]
    const content = rows.map((r) => r.join(', ')).join('\n')
    const id = ensureUniqueId(usedIds, fileName)
    logger?.log?.(`[RAG] Loaded CSV document "${fileName}"`)
    return { id, content }
  } else {
    logger?.debug?.(`[RAG] Ignored unsupported file: "${fileName}"`)
    return null
  }
}

/**
 * Derive a deterministic cache filename from a URL.
 */
export function deriveCacheFilename(url: string) {
  const u = new URL(url)
  const baseName = path.basename(u.pathname) || 'remote-file'
  const cleanBase = baseName.split('?')[0] || baseName
  const ext = path.extname(cleanBase).toLowerCase()
  const namePart = cleanBase.replace(ext, '') || 'remote-file'
  const digest = createHash('sha1').update(url).digest('hex').slice(0, 12)
  const cacheFileName = `${namePart}-${digest}${ext}`
  return cacheFileName
}

/**
 * Download a remote document and return normalized text content.
 */
export async function loadRemoteDocument(
  url: string,
  cacheDir: string,
  options: CsvParseOptions,
  usedIds: Set<string>,
  logger?: Logger,
): Promise<{ id: string; content: string } | null> {
  try {
    const cacheFileName = deriveCacheFilename(url)
    const digest = createHash('sha1').update(url).digest('hex').slice(0, 12)
    let cachePath = path.join(cacheDir, cacheFileName)

    // Try exact cached filename first
    try {
      const st = await fs.stat(cachePath)
      if (st.isFile()) {
        logger?.log?.(`[RAG] Using cached remote document for URL: "${url}" -> ${path.basename(cachePath)}`)
        return await loadLocalDocument(cachePath, path.basename(cachePath), options, usedIds, logger)
      }
    } catch {}

    // If not found, try to locate any file that matches the digest
    try {
      const entries = await fs.readdir(cacheDir)
      const found = entries.find((f) => f.includes(`-${digest}`))
      if (found) {
        cachePath = path.join(cacheDir, found)
        logger?.log?.(`[RAG] Using cached remote document (digest match) for URL: "${url}" -> ${found}`)
        return await loadLocalDocument(cachePath, found, options, usedIds, logger)
      }
    } catch {}

    const resp = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024,
      validateStatus: (s) => s >= 200 && s < 300,
    })
    const buffer = Buffer.from(resp.data)

    // Determine filename and extension from headers if URL had none
    const contentDisposition = (resp.headers?.['content-disposition'] as string | undefined) || ''
    const contentType = (resp.headers?.['content-type'] as string | undefined) || ''

    const nameFromHeader = extractFilenameFromDisposition(contentDisposition)
    const u = new URL(url)
    const urlBase = path.basename(u.pathname) || 'remote-file'
    const cleanBase = (nameFromHeader || urlBase).split('?')[0]
    let ext = path.extname(cleanBase)
    if (!ext) {
      const guessed = inferExtensionFromContentType(contentType)
      ext = guessed || '.txt'
    }
    const namePart = (cleanBase || 'remote-file').replace(ext, '')
    const finalFileName = `${namePart}-${digest}${ext.toLowerCase()}`
    cachePath = path.join(cacheDir, finalFileName)

    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(cachePath, buffer)
    logger?.log?.(`[RAG] Cached remote document: ${finalFileName}`)
    return await loadLocalDocument(cachePath, finalFileName, options, usedIds, logger)
  } catch (err) {
    logger?.error?.(`[RAG] Error downloading or processing URL "${url}": ${err instanceof Error ? err.message : err}`)
    return null
  }
}

/** Extract a filename from a Content-Disposition header */
function extractFilenameFromDisposition(header: string): string | null {
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(header)
  if (!match) return null
  return decodeURIComponent((match[1] || match[2] || '').trim()) || null
}

/** Infer a likely file extension from a Content-Type header. */
function inferExtensionFromContentType(ct: string): string | null {
  const type = ct.split(';')[0].trim().toLowerCase()
  switch (type) {
    case 'application/pdf':
      return '.pdf'
    case 'text/csv':
    case 'application/csv':
      return '.csv'
    case 'text/plain':
      return '.txt'
    case 'text/markdown':
      return '.md'
    default:
      return null
  }
}
