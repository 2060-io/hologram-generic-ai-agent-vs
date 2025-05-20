import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export interface IMemoryBackend {
  getHistory(sessionId: string): Promise<ChatMessage[]>
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void>
  clear(sessionId: string): Promise<void>
}

class InMemoryBackend implements IMemoryBackend {
  private readonly windowSize: number
  private readonly memory: Map<string, ChatMessage[]> = new Map()

  constructor(windowSize: number) {
    this.windowSize = windowSize
  }

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    return (await this.memory.get(sessionId)) ?? []
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const history = await this.getHistory(sessionId)
    history.push({ role, content })
    while (history.length > this.windowSize) {
      history.shift()
    }
    this.memory.set(sessionId, history)
  }

  async clear(sessionId: string): Promise<void> {
    this.memory.delete(sessionId)
  }
}

class RedisMemoryBackend implements IMemoryBackend, OnModuleInit, OnModuleDestroy {
  private readonly windowSize: number
  private readonly redis: RedisClientType

  constructor(windowSize: number, redisUrl: string) {
    this.windowSize = windowSize
    this.redis = createClient({ url: redisUrl })
  }

  async onModuleInit() {
    await this.redis.connect()
  }

  async onModuleDestroy() {
    await this.redis.quit()
  }

  private key(sessionId: string) {
    return `chat:history:${sessionId}`
  }

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const data = await this.redis.lRange(this.key(sessionId), 0, -1)
    return data.map((json) => JSON.parse(json)) as ChatMessage[]
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const msg = JSON.stringify({ role, content })
    await this.redis.rPush(this.key(sessionId), msg)
    await this.redis.lTrim(this.key(sessionId), -this.windowSize, -1)
    // Opcional: establece expiración para limpiar sesiones viejas
    await this.redis.expire(this.key(sessionId), 60 * 60 * 4) // 4 horas
  }

  async clear(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId))
  }
}

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
    if ('onModuleInit' in this.backend && typeof this.backend.onModuleInit === 'function') {
      await (this.backend as any).onModuleInit()
    }
  }

  async onModuleDestroy() {
    if ('onModuleDestroy' in this.backend && typeof this.backend.onModuleDestroy === 'function') {
      await (this.backend as any).onModuleDestroy()
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
