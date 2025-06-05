export interface LlmProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>
}
export interface GenerateOptions {
  userLang?: string
  model?: string
  max_tokens?: number
}

export type SupportedProviders = 'openai' | 'anthropic' | 'ollama'

export interface ExternalToolDef {
  name: string
  description: string
  endpoint: string
  method?: 'GET' | 'POST'
  authHeader?: string
  authToken?: string
}
