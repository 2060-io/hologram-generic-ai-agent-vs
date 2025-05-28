import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from '@langchain/pinecone'
import { RedisVectorStore } from '@langchain/redis'
import { createClient, RedisClientType } from 'redis'
import { OpenAIEmbeddings, OpenAI } from '@langchain/openai'
import { loadDocuments } from './utils/load-documents'

type SupportedStores = 'pinecone' | 'redis'

/**
 * Service for modular Retrieval Augmented Generation (RAG) using LangChainJS.
 * Supports multiple vector stores (Pinecone, Redis) via environment-based configuration.
 * Handles document ingestion, similarity search, and LLM context generation.
 */
@Injectable()
export class LangchainRagService implements OnModuleInit {
  private vectorStore: PineconeStore | RedisVectorStore
  private redisClient: RedisClientType | undefined
  private llm: OpenAI
  private readonly logger = new Logger(LangchainRagService.name)

  /**
   * Constructs the RAG service.
   * @param configService - The NestJS ConfigService for environment/config access.
   */
  constructor(private configService: ConfigService) {}

  /**
   * Initializes the vector store (Pinecone or Redis) and LLM (OpenAI).
   * Selection is dynamic based on VECTOR_STORE env/config.
   * Logs each initialization step for observability.
   */
  async onModuleInit() {
    const vectorStoreProvider = this.configService.get<string>('appConfig.vectorStore') as SupportedStores
    const openaiApiKey = this.configService.get<string>('appConfig.openaiApiKey') || process.env.OPENAI_API_KEY
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: openaiApiKey! })

    this.logger.log(`Initializing Vector Store: ${vectorStoreProvider}`)

    if (vectorStoreProvider === 'pinecone') {
      // Initialize Pinecone vector store
      this.logger.log('Connecting to Pinecone...')
      const pinecone = new Pinecone({
        apiKey: this.configService.get<string>('appConfig.pineconeApiKey')!,
      })
      const pineconeIndex = pinecone.index(
        this.configService.get<string>('appConfig.vectorIndexName') || process.env.VECTOR_INDEX_NAME!,
      )
      this.logger.debug('Pinecone index instance created.')
      this.vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex })
      this.logger.log('Pinecone vector store initialized.')
    } else if (vectorStoreProvider === 'redis') {
      // Initialize Redis vector store
      const redisUrl = this.configService.get<string>('appConfig.redisUrl') || process.env.REDIS_URL
      const redisIndexName =
        this.configService.get<string>('appConfig.redisIndexName') || process.env.VECTOR_INDEX_NAME!
      this.logger.log(`Connecting to Redis at ${redisUrl} with index ${redisIndexName}...`)
      this.redisClient = createClient({ url: redisUrl }) as RedisClientType
      await this.redisClient.connect()
      this.logger.debug('Redis client connected.')
      this.vectorStore = new RedisVectorStore(embeddings, {
        redisClient: this.redisClient as any,
        indexName: redisIndexName,
      })
      this.logger.log('Redis vector store initialized.')
    } else {
      this.logger.error(`Unsupported VECTOR_STORE: ${JSON.stringify(vectorStoreProvider)}`)
      throw new Error(`Unsupported VECTOR_STORE: ${JSON.stringify(vectorStoreProvider)}`)
    }

    const docsPath = this.configService.get<string>('appConfig.ragDocsPath') || './docs'
    this.logger.log(`[RAG] Loading documents from: ${docsPath}`)
    const docs = await loadDocuments(docsPath, this.logger)
    for (const doc of docs) {
      await this.addDocument(doc.id, doc.content)
    }
    this.logger.log('Seeded vector store with initial document.')

    this.llm = new OpenAI({ openAIApiKey: openaiApiKey! })
    this.logger.log('LLM (OpenAI) instance created.')
  }

  /**
   * Adds a document to the vector store for RAG-based retrieval.
   * @param id - Unique identifier for the document.
   * @param text - Content of the document to index.
   */
  async addDocument(id: string, text: string) {
    this.logger.debug(`Adding document to vector store | id: ${id}`)
    await this.vectorStore.addDocuments([{ pageContent: text, metadata: { id } }])
    this.logger.verbose(`Document "${id}" added to vector store.`)
  }

  /**
   * Retrieves relevant context documents from the vector store.
   * @param query - User's question or query string.
   * @returns Array of relevant context snippets.
   */
  async retrieveContext(query: string): Promise<string[]> {
    this.logger.debug(`Retrieving context for query: "${query}"`)
    const results = await this.vectorStore.similaritySearch(query, 3)
    this.logger.verbose(`Context retrieved: ${results.length} result(s) for query "${query}".`)
    return results.map((r) => r.pageContent)
  }

  /**
   * Cleans up resources (closes Redis client if used) when the module is destroyed.
   */
  onModuleDestroy() {
    if (this.redisClient) {
      this.logger.log('Disconnecting Redis client...')
      this.redisClient.destroy()
      this.logger.log('Redis client disconnected.')
    }
  }
}
