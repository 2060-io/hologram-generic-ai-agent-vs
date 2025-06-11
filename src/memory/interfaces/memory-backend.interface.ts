export type ChatMessage = { role: 'user' | 'system'; content: string }

export interface IMemoryBackend {
  getHistory(sessionId: string): Promise<ChatMessage[]>
  addMessage(sessionId: string, role: 'user' | 'system', content: string): Promise<void>
  clear(sessionId: string): Promise<void>
}
