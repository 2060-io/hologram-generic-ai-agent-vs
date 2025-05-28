import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LlmProvider, OllamaResponse } from '../interfaces/llm-provider.interface'
import axios from 'axios'

/**
 * OllamaProvider
 *
 * LLM Provider for Ollama. Generates completions using local Ollama models.
 * Supports configurable endpoint and model selection via environment variables.
 */
@Injectable()
export class OllamaProvider implements LlmProvider {
  private readonly logger = new Logger(OllamaProvider.name)
  private readonly endpoint: string
  private readonly defaultModel: string

  /**
   * Constructs the OllamaProvider with injected configuration.
   * @param configService NestJS ConfigService for loading environment variables.
   */
  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('appConfig.ollamaEndpoint', 'http://localhost:11434')
    this.defaultModel = this.configService.get<string>('appConfig.ollamaModel', 'llama3')
    this.logger.log(`OllamaProvider initialized with endpoint: ${this.endpoint}, default model: ${this.defaultModel}`)
  }

  /**
   * Generates a response using the Ollama API.
   *
   * @param prompt The prompt to send to the LLM.
   * @param options Options object (may include model override).
   * @returns The generated text.
   * @throws Error if Ollama returns empty content or the API call fails.
   */
  async generate(prompt: string, options?: any): Promise<string> {
    const model = options?.model || this.defaultModel
    const url = this.endpoint.endsWith('/api/generate')
      ? this.endpoint
      : this.endpoint.replace(/\/+$/, '') + '/api/generate'

    this.logger.debug(`Generating completion with model "${model}" at endpoint "${url}"`)
    this.logger.verbose(`Prompt sent to Ollama: ${prompt}`)

    try {
      const response = await axios.post<OllamaResponse>(url, {
        model,
        prompt,
        stream: false,
      })

      const content = response.data.response
      if (!content) {
        this.logger.error('Ollama returned empty content')
        throw new Error('Ollama returned empty content')
      }
      this.logger.debug(`Response received from Ollama: ${content.trim()}`)
      return content.trim()
    } catch (error) {
      this.logger.error(`Error generating completion from Ollama: ${error.message}`, error.stack)
      throw error
    }
  }
}
