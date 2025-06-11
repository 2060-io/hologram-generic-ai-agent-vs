import { registerAs } from '@nestjs/config'

/**
 * Global application configuration loader.
 * Organizes and documents all environment variables.
 */
export default registerAs('appConfig', () => ({
  // Application General Settings

  /**
   * The port number where the application HTTP server runs.
   * Default: 3000
   */
  appPort: parseInt(process.env.APP_PORT || '3000', 10),

  /**
   * Log level for application logging.
   * Default: 1 (minimal logs)
   */
  logLevel: parseInt(process.env.LOG_LEVEL || '1', 10),

  // LLM & Agent Settings

  /**
   * The default agent prompt to define the LLM's persona/role.
   */
  agentPrompt: process.env.AGENT_PROMPT || '',

  /**
   * LLM provider to use: "openai" | "ollama" | "anthropic" | etc.
   * Default: openai
   */
  llmProvider: process.env.LLM_PROVIDER || 'openai',

  /**
   * Ollama endpoint URL for local LLM inference.
   * Default: http://localhost:11434
   */
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',

  /**
   * Model name for Ollama provider (e.g., "llama3", "phi3", etc).
   * Default: llama3
   */
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3',

  /**
   * OpenAI API key (required if using OpenAI provider).
   */
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  /**
   * OpenAI Model .
   */

  openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',

  /**
   * Anthropic API key (required if using Anthropic provider, e.g., Claude).
   */
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // RAG (Retrieval Augmented Generation) Settings

  /**
   * Directory path from which RAG loads .txt and .pdf documents for context retrieval.
   */
  ragDocsPath: process.env.RAG_DOCS_PATH || './docs',

  /**
   * RAG provider selection. "vectorstore" (custom) or "langchain" (with supported vector stores).
   * Default: "vectorstore"
   */
  ragProvider: process.env.RAG_PROVIDER || 'vectorstore',

  /**
   * Vector store provider for RAG: "pinecone","redis" etc.
   * Used when RAG_PROVIDER = "langchain"
   * Default: redis
   */
  vectorStore: process.env.VECTOR_STORE || 'redis',

  /**
   * Shared index name for all supported vector stores (e.g., Pinecone, Redis).
   * Set as VECTOR_INDEX_NAME in your environment.
   * Default: hologram-ia
   */
  vectorIndexName: process.env.VECTOR_INDEX_NAME || 'hologram-ia',

  /**
   * Pinecone API key (required if using Pinecone vector store).
   */
  pineconeApiKey: process.env.PINECONE_API_KEY || '',

  // Memory/Session Settings

  /**
   * Memory backend: "memory" for in-memory, "redis" for Redis.
   * Default: memory
   */
  agentMemoryBackend: process.env.AGENT_MEMORY_BACKEND || 'memory',

  /**
   * Number of messages/tokens to keep in session memory window.
   * Default: 8
   */
  agentMemoryWindow: parseInt(process.env.AGENT_MEMORY_WINDOW || '8', 10),

  // External Service URLs

  /**
   * Redis database URL for persistent memory/session storage.
   * Default: redis://localhost:6379
   */
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // PostgreSQL Database Configuration

  /**
   * Hostname or IP address for the PostgreSQL database.
   * Default: "postgres"
   */
  postgresHost: process.env.POSTGRES_HOST || 'postgres',

  /**
   * Username for the PostgreSQL database.
   * Default: "2060demo"
   */
  postgresUser: process.env.POSTGRES_USER || '2060demo',

  /**
   * Name for the PostgreSQL database.
   * Default: "test-service-agent"
   */
  postgresDbName: process.env.POSTGRES_DB_NAME || 'test-service-agent',

  /**
   * Password for the PostgreSQL database.
   * Default: "2060demo"
   */
  postgresPassword: process.env.POSTGRES_PASSWORD || '2060demo',

  // Other Service URLs / Settings

  /**
   * Verifiable credential definition id or URL.
   * Default: "did:web:example.com??service=anoncreds&relativeRef=/credDef/somethinghere"
   */
  credentialDefinitionId: process.env.CREDENTIAL_DEFINITION_ID,

  /**
   * Service Agent Admin API URL.
   */
  vsAgentAdminUrl: process.env.VS_AGENT_ADMIN_URL,

  /**
   * - llmToolsConfig: JSON string defining external tools available to the LLM agent.
   *   Each tool should specify a unique name, description, endpoint, HTTP method,
   *   and any authentication if required.
   *
   *   Example (set in your .env):
   *   LLM_TOOLS_CONFIG=[
   *     {
   *       "name": "getStats",
   *       "description": "Query system statistics by keyword.",
   *       "endpoint": "https://api.example.com/stats?query={query}",
   *       "method": "GET"
   *     }
   *   ]
   */
  llmToolsConfig: process.env.LLM_TOOLS_CONFIG || '[]',
}))
