import { promises as fs } from 'fs'
import * as path from 'path'
import * as pdfParse from 'pdf-parse'

/**
 * Loads all .txt and .pdf files from the given folder.
 * If no valid documents are found, creates a sample file for testing.
 * Returns an array of objects: { id: fileName, content: extractedText }
 *
 * @param folderPath - Absolute or relative path to the folder containing documents.
 * @param logger - Optional logger object (with log, error, debug methods).
 */
export async function loadDocuments(
  folderPath: string,
  logger?: { log: Function; error: Function; debug?: Function },
): Promise<{ id: string; content: string }[]> {
  const documents: { id: string; content: string }[] = []
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
        if (ext === '.txt') {
          const content = await fs.readFile(fullPath, 'utf-8')
          documents.push({ id: file, content })
          logger?.log?.(`[RAG] Loaded TXT document "${file}"`)
          foundDocs = true
        } else if (ext === '.pdf') {
          const dataBuffer = await fs.readFile(fullPath)
          const pdfData = await pdfParse(dataBuffer)
          documents.push({ id: file, content: pdfData.text })
          logger?.log?.(`[RAG] Loaded PDF document "${file}"`)
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
