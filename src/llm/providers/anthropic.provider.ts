import { LlmProvider } from '../interfaces/llm-provider.interface'
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicProvider implements LlmProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async generate(prompt: string, options?: any): Promise<string> {
    const model = options?.model || 'claude-3-opus-20240229'
    const completion = await this.client.messages.create({
      model,
      max_tokens: options?.max_tokens || 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlocks = completion.content.filter((block: any) => block.type === 'text').map((block: any) => block.text)

    const content = textBlocks.join('\n').trim()

    if (!content) {
      throw new Error('Anthropic returned empty content')
    }
    return content
  }
}
