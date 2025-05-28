export interface LlmProvider {
  generate(prompt: string, options?: any): Promise<string>
}

export type MessageBlock = {
  type: 'text'
  text: string
}

export type OllamaResponse = {
  response: string
}
