export interface LlmProvider {
  generate(prompt: string, options?: any): Promise<string>
}
