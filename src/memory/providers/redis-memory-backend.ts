import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ChatMessage, IMemoryBackend } from '../interfaces/memory-backend.interface'
import { createClient, RedisClientType } from 'redis'

export class RedisMemoryBackend implements IMemoryBackend, OnModuleInit, OnModuleDestroy {
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
    await this.redis.expire(this.key(sessionId), 60 * 60 * 4)
  }

  async clear(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId))
  }
}
