import type { Logger } from '@nestjs/common'

/**
 * Options to load and normalize documents for RAG ingestion.
 * - folderBasePath: directory used for local docs and remote cache
 * - logger: optional NestJS logger for tracing
 * - remoteUrls: optional list of remote document URLs to fetch and cache
 */
export type LoadDocumentsOptions = {
  folderBasePath: string
  logger?: Logger
  remoteUrls?: string[]
}
