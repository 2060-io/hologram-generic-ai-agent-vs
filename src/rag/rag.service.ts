import { Injectable, Logger } from '@nestjs/common'
import { VectorStoreService } from './vector-store.service'

/**
 * Service for Retrieval Augmented Generation (RAG).
 * Provides methods to store and retrieve relevant context documents for LLM queries.
 */
@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name)

  /**
   * Constructs the RagService with a VectorStoreService dependency.
   * @param vectorStore The vector storage backend used for semantic search.
   */
  constructor(private readonly vectorStore: VectorStoreService) {}

  /**
   * Retrieves the most relevant context documents for a given user query.
   * Used in RAG pipelines to supply knowledge to the LLM.
   * @param query The user query or message.
   * @returns Promise resolving to an array of relevant document texts.
   */
  async retrieveContext(query: string): Promise<string[]> {
    this.logger.debug(`Retrieving context for query: "${query}"`)
    const results = await this.vectorStore.query(query, 3)
    this.logger.verbose(`Retrieved ${results.length} context documents`)
    return results.map((r) => r.text)
  }

  /**
   * Adds a new document to the vector store for future retrieval.
   * @param id Unique identifier for the document.
   * @param text The text content to index and store.
   */
  async addDocument(id: string, text: string) {
    this.logger.debug(`Adding document to vector store | id: ${id}`)
    await this.vectorStore.addDocument(id, text)
    this.logger.verbose(`Document "${id}" added to vector store`)
  }
}
