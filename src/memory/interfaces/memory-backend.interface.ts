export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export interface IMemoryBackend {
  getHistory(sessionId: string): Promise<ChatMessage[]>
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void>
  clear(sessionId: string): Promise<void>
}
