import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from '@langchain/pinecone'
import { OpenAIEmbeddings, OpenAI } from '@langchain/openai'
import { ConfigService } from '@nestjs/config'
import { FakeEmbeddings } from 'src/llm/providers/fake-embeddings.provider'

/**
 * Service for managing Retrieval Augmented Generation (RAG) using Langchain and Pinecone.
 * Handles document ingestion and semantic retrieval for enhanced LLM responses.
 */
@Injectable()
export class LangchainRagService implements OnModuleInit {
  private vectorStore: PineconeStore
  private llm: OpenAI
  private readonly logger = new Logger(LangchainRagService.name)

  /**
   * Constructs the LangchainRagService.
   * @param configService The NestJS ConfigService for environment/config access.
   */
  constructor(private configService: ConfigService) {}

  /**
   * Initializes the vector store (Pinecone) and LLM (OpenAI).
   * Uses a mock embedding generator by default; replace with OpenAIEmbeddings for real usage.
   */
  async onModuleInit() {
    this.logger.log('Initializing Pinecone vector store...')
    const pinecone = new Pinecone({
      apiKey: this.configService.get<string>('appConfig.pineconeApiKey')!,
    })
    const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!)
    this.logger.debug('Pinecone index created.')

    // For development/testing, use FakeEmbeddings. Swap to OpenAIEmbeddings for production.
    this.vectorStore = await PineconeStore.fromExistingIndex(
      new FakeEmbeddings(),
      // new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! }),
      { pineconeIndex },
    )
    this.logger.log('Vector store initialized.')

    this.llm = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY! })
    this.logger.log('LLM (OpenAI) instance created.')
  }

  /**
   * Adds a document to the vector store for RAG-based retrieval.
   * @param id Unique identifier for the document.
   * @param text Content of the document to index.
   */
  async addDocument(id: string, text: string) {
    this.logger.debug(`Adding document to vector store | id: ${id}`)
    await this.vectorStore.addDocuments([{ pageContent: text, metadata: { id } }])
    this.logger.verbose(`Document "${id}" added to Pinecone vector store.`)
  }

  /**
   * Performs a RAG-augmented query to retrieve context and answer via LLM.
   * @param question The user's question.
   * @returns LLM-generated answer string.
   */
  async askWithRag(question: string): Promise<string> {
    this.logger.debug(`Performing RAG search for question: "${question}"`)
    const results = await this.vectorStore.similaritySearch(question, 3)
    const context = results.map((r) => r.pageContent).join('\n---\n')
    this.logger.verbose(`Context for LLM: ${context ? context.slice(0, 200) + '...' : '[none]'}`)

    // Template is Spanish here. Could be made multilanguage.
    const prompt = `
      Usa la siguiente información para responder la pregunta del usuario.
      Contexto:
      ${context}
      Pregunta: ${question}
      Responde de forma clara y breve.
    `
    this.logger.debug('Invoking LLM with constructed prompt.')
    return this.llm.invoke(prompt)
  }
}
