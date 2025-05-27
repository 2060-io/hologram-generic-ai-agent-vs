import { LlmProvider } from '../interfaces/llm-provider.interface'
import { OpenAI } from 'openai'
import { OpenAiProviderConfig } from '../interfaces/openai-provider-config.interface'

export class OpenAiProvider implements LlmProvider {
  private client: OpenAI
  private model: string

  constructor(config: OpenAiProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Missing OpenAI API key')
    }

    this.model = config.model || 'gpt-3.5-turbo'
    this.client = new OpenAI({ apiKey: config.apiKey })
  }

  async generate(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    })
    return completion.choices[0].message.content ?? ''
  }
}
