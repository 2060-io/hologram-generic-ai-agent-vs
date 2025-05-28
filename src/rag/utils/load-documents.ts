import { promises as fs } from 'fs'
import * as path from 'path'
import pdfParse from 'pdf-parse'
import { parse as csvParse, Options as CsvParseOptions } from 'csv-parse/sync'

import { Logger } from '@nestjs/common'

/**
 * Loads all .txt, .md, .pdf, and .csv files from the given folder.
 * If no valid documents are found, creates a sample file for testing.
 * Returns an array of objects: { id: fileName, content: extractedText }
 *
 * @param folderPath - Absolute or relative path to the folder containing documents.
 * @param logger - Optional logger object (with log, error, debug methods).
 */
export async function loadDocuments(folderPath: string, logger?: Logger): Promise<{ id: string; content: string }[]> {
  const documents: { id: string; content: string }[] = []
  const options: CsvParseOptions = {
    skip_empty_lines: true,
    columns: false,
  }
  try {
    await fs.mkdir(folderPath, { recursive: true })
    const files = await fs.readdir(folderPath)
    let foundDocs = false
    for (const file of files) {
      const fullPath = path.join(folderPath, file)
      const stat = await fs.stat(fullPath)
      if (!stat.isFile()) continue
      const ext = path.extname(file).toLowerCase()
      try {
        if (ext === '.txt' || ext === '.md') {
          const content = await fs.readFile(fullPath, 'utf-8')
          documents.push({ id: file, content })
          logger?.log?.(`[RAG] Loaded ${ext.toUpperCase()} document "${file}"`)
          foundDocs = true
        } else if (ext === '.pdf') {
          const dataBuffer = await fs.readFile(fullPath)
          const pdfData = await pdfParse(dataBuffer)
          documents.push({ id: file, content: pdfData.text })
          logger?.log?.(`[RAG] Loaded PDF document "${file}"`)
          foundDocs = true
        } else if (ext === '.csv') {
          const csvContent = await fs.readFile(fullPath, 'utf-8')
          const rows: string[][] = csvParse(csvContent, options) as string[][]
          const content = rows.map((r) => r.join(', ')).join('\n')
          documents.push({ id: file, content })
          logger?.log?.(`[RAG] Loaded CSV document "${file}"`)
          foundDocs = true
        } else {
          logger?.debug?.(`[RAG] Ignored unsupported file: "${file}"`)
        }
      } catch (err) {
        logger?.error?.(`[RAG] Error processing file "${file}": ${err}`)
      }
    }

    // If no documents found, create a sample file
    if (!foundDocs) {
      const samplePath = path.join(folderPath, 'example.txt')
      const exampleText = 'This is an example document for testing the RAG system.'
      await fs.writeFile(samplePath, exampleText)
      documents.push({ id: 'example.txt', content: exampleText })
      logger?.log?.(`[RAG] No documents found. Created sample file: "example.txt"`)
    }
  } catch (err) {
    logger?.error?.(`[RAG] Error loading documents from ${folderPath}: ${err}`)
  }
  return documents
}
