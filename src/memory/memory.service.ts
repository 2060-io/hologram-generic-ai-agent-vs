import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import { ChatMessage, IMemoryBackend } from './interfaces/memory-backend.interface'
import { InMemoryBackend } from './providers/in-memory-backend'
import { RedisMemoryBackend } from './providers/redis-memory-backend'

/**
 * MemoryService supporting both in-memory Map and Redis backend.
 * Select backend via env AGENT_MEMORY_BACKEND = 'memory' | 'redis'.
 */
@Injectable()
export class MemoryService implements OnModuleInit, OnModuleDestroy {
  private backend: IMemoryBackend

  constructor() {
    const backendType = process.env.AGENT_MEMORY_BACKEND ?? 'memory'
    const windowSize = Number(process.env.AGENT_MEMORY_WINDOW ?? 8)

    if (backendType === 'redis') {
      const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'
      this.backend = new RedisMemoryBackend(windowSize, redisUrl)
    } else {
      this.backend = new InMemoryBackend(windowSize)
    }
  }

  async onModuleInit() {
    if (typeof (this.backend as Partial<OnModuleInit>).onModuleInit === 'function') {
      await (this.backend as unknown as OnModuleInit).onModuleInit()
    }
  }

  async onModuleDestroy() {
    if (typeof (this.backend as Partial<OnModuleDestroy>).onModuleDestroy === 'function') {
      await (this.backend as unknown as OnModuleDestroy).onModuleDestroy()
    }
  }

  /** Get chat history for a session */
  getHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.backend.getHistory(sessionId)
  }

  /** Add a message to the session's memory */
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    return this.backend.addMessage(sessionId, role, content)
  }

  /** Clear the session's memory */
  clear(sessionId: string): Promise<void> {
    return this.backend.clear(sessionId)
  }
}
