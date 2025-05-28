export interface LlmProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>
}

export type MessageBlock = {
  type: 'text'
  text: string
}

export type OllamaResponse = {
  response: string
}

export interface GenerateOptions {
  userLang?: string
  model?: string
  max_tokens?: number
}
