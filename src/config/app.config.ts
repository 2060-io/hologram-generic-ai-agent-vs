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
   * Anthropic API key (required if using Anthropic provider, e.g., Claude).
   */
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // RAG (Retrieval Augmented Generation) Settings

  /**
   * Vector store provider for RAG: "pinecone", etc.
   */
  vectorStore: process.env.VECTOR_STORE || '',

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
}))
