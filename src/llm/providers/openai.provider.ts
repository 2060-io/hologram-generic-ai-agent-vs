import { LlmProvider } from '../interfaces/llm-provider.interface'
import { OpenAI } from 'openai'

//TODO: the PROMT it is configurable

export class OpenAiProvider implements LlmProvider {
  private client: OpenAI
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }
  async generate(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    })
    return completion.choices[0].message.content ?? ''
  }
}
