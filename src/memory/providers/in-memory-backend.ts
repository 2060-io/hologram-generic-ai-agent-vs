import { ChatMessage, IMemoryBackend } from '../interfaces/memory-backend.interface'

export class InMemoryBackend implements IMemoryBackend {
  private readonly windowSize: number
  private readonly memory: Map<string, ChatMessage[]> = new Map()

  constructor(windowSize: number) {
    this.windowSize = windowSize
  }

  getHistory(sessionId: string): Promise<ChatMessage[]> {
    return Promise.resolve(this.memory.get(sessionId) ?? [])
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const history = await this.getHistory(sessionId)
    history.push({ role, content })
    while (history.length > this.windowSize) {
      history.shift()
    }
    this.memory.set(sessionId, history)
  }

  clear(sessionId: string): Promise<void> {
    this.memory.delete(sessionId)
    return Promise.resolve()
  }
}
