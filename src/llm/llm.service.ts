import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LlmProvider } from './interfaces/llm-provider.interface'
import { OpenAiProvider } from './providers/openai.provider'
import { OllamaProvider } from './providers/ollama.provider'
import { AnthropicProvider } from './providers/anthropic.provider'
import { detectLanguage } from 'src/common/utils/lang-detect.util'

/**
 * Service responsible for connecting to different LLM providers and building the final prompt for the agent.
 */
@Injectable()
export class LlmService {
  private provider: LlmProvider
  private readonly agentPrompt: string
  private readonly logger = new Logger(LlmService.name)

  /**
   * Initializes the LlmService with the appropriate provider and loads the agent prompt from environment variables.
   * @param configService NestJS ConfigService for loading environment variables.
   */
  constructor(private configService: ConfigService) {
    this.agentPrompt = this.configService.get<string>('appConfig.agentPrompt') ?? ''
    const llmProvider = this.configService.get<string>('appConfig.llmProvider') // 'openai', 'ollama', 'anthropic'
    this.logger.log(`Initializing LlmService with provider: ${llmProvider}`)

    if (llmProvider === 'ollama') {
      this.provider = new OllamaProvider(this.configService)
      this.logger.log('OllamaProvider selected.')
    } else if (llmProvider === 'anthropic') {
      const apiKey = this.configService.get<string>('appConfig.anthropicApiKey')
      if (!apiKey) {
        this.logger.error('ANTHROPIC_API_KEY not set in environment variables!')
        throw new Error('ANTHROPIC_API_KEY not set')
      }
      this.provider = new AnthropicProvider(apiKey)
      this.logger.log('AnthropicProvider selected.')
    } else {
      const apiKey = this.configService.get<string>('appConfig.openaiApiKey')
      const model = this.configService.get<string>('appConfig.openaiModel')
      if (!apiKey) {
        this.logger.error('OPENAI_API_KEY not set in environment variables!')
        throw new Error('OPENAI_API_KEY not set')
      }
      this.provider = new OpenAiProvider({ apiKey, model })
      this.logger.log('OpenAiProvider selected.')
    }
    this.logger.debug(`Agent prompt loaded: "${this.agentPrompt}"`)
  }

  /**
   * Builds the final prompt for the LLM using the agent prompt and user-specific options.
   * @param userMessage The user message to include in the prompt.
   * @param options Optional parameters (e.g. user language).
   * @returns The final prompt string to send to the LLM.
   */
  buildPrompt(userMessage: string, options?: { userLang?: string }): string {
    let prompt = this.agentPrompt
    // If the user language is not English, force the agent to answer in that language
    if (options?.userLang && options.userLang.toLowerCase() !== 'en') {
      prompt += ` Always respond in ${options.userLang}, unless told otherwise.`
      this.logger.debug(`Agent will answer in language: ${options.userLang}`)
    }
    // Combine the agent prompt and user message in a typical conversational format
    const finalPrompt = `${prompt}\nUser: ${userMessage}`
    this.logger.verbose(`Built prompt: ${finalPrompt}`)
    return finalPrompt
  }

  /**
   * Generates a response from the LLM using the agent's role prompt and user message.
   * @param userMessage The user's input message.
   * @param options Optional parameters (e.g. user language, model, etc.)
   * @returns The LLM's response as a string.
   */
  async generate(userMessage: string, options?: { userLang?: string; [key: string]: unknown }): Promise<string> {
    let lang = options?.userLang
    if (!lang) {
      lang = detectLanguage(userMessage)
      this.logger.log(`Detected user language: ${lang}`)
    }
    const prompt = this.buildPrompt(userMessage, { userLang: lang })
    this.logger.debug(`Sending prompt to provider: "${prompt}"`)
    try {
      const result = await this.provider.generate(prompt, { ...options, userLang: lang })
      this.logger.debug('LLM provider returned response.')
      return result
    } catch (error) {
      this.logger.error(`Error during LLM provider generation: ${JSON.stringify(error)}`)
      throw error
    }
  }
}
