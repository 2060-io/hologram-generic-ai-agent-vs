import { Injectable, Logger } from '@nestjs/common'
import { VectorStoreService } from './vector-store.service'
import { IRagBackend } from './interfaces/rag-backend.interface'
import { ConfigService } from '@nestjs/config'
import { LangchainRagService } from './langchain-rag.service'

/**
 * Service for Retrieval Augmented Generation (RAG).
 * Provides methods to store and retrieve relevant context documents for LLM queries.
 */
@Injectable()
export class RagService implements IRagBackend {
  private backend: IRagBackend

  constructor(configService: ConfigService, vectorStore: VectorStoreService, langchain: LangchainRagService) {
    const provider = configService.get<string>('appConfig.ragProvider', 'vectorstore')
    this.backend = provider === 'langchain' ? langchain : vectorStore
  }

  async retrieveContext(query: string): Promise<string[]> {
    return this.backend.retrieveContext(query)
  }
  async addDocument(id: string, text: string) {
    return this.backend.addDocument(id, text)
  }
}
