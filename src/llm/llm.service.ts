import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z as zod } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOllama } from '@langchain/ollama'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { createToolCallingAgent } from 'langchain/agents'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { AIMessage, BaseMessage } from '@langchain/core/messages'
import { ExternalToolDef, SupportedProviders } from './interfaces/llm-provider.interface'
import { detectLanguage } from 'src/common/utils/lang-detect.util'

/**
 * LlmService
 *
 * Service responsible for managing the connection with different LLM providers (OpenAI, Anthropic, Ollama).
 * Supports dynamic tool integration, prompt management, and error/logging handling.
 * This service is agnostic to the frontend and can be used from different orchestrators (chatbot, API, etc).
 */
@Injectable()
export class LlmService {
  /** Logger for LlmService operations */
  private readonly logger = new Logger(LlmService.name)
  /** The current LLM instance (OpenAI, Anthropic, or Ollama) */
  private llm: ChatOpenAI | ChatAnthropic | ChatOllama
  /** Tool-enabled agent executor (if tools are configured) */
  private agentExecutor: any = null
  /** The agent's system prompt (loaded from environment) */
  private readonly agentPrompt: string

  /**
   * Initializes the LlmService, selects the LLM provider, builds tools if defined,
   * and configures the tool-calling agent if supported.
   *
   * @param config - The NestJS ConfigService instance.
   */
  constructor(private readonly config: ConfigService) {
    this.agentPrompt = this.config.get<string>('appConfig.agentPrompt') ?? 'You are a helpful AI agent called Hologram.'

    const provider = (this.config.get<string>('LLM_PROVIDER') ?? 'openai') as SupportedProviders
    this.llm = this.instantiateLlm(provider)
    const tools = this.buildTools()

    if (tools.length && (provider === 'openai' || provider === 'anthropic')) {
      this.setupToolAgent(tools)
        .then(() => this.logger.log(`Tool-enabled agent initialised with ${tools.length} tools.`))
        .catch((err) => this.logger.error(`Failed to build Tool agent: ${err}`))
    } else if (provider === 'ollama') {
      this.logger.warn('Ollama does not support tools. Only plain prompts will be used.')
    } else {
      this.logger.log('Initializing without tools.')
    }
  }

  /**
   * Generates a response from the LLM agent, using tool-enabled agents if available,
   * otherwise falls back to a plain system+user prompt.
   * Handles context/history placeholder requirements, logs execution steps, and manages errors gracefully.
   *
   * @param userMessage - The raw user input/message for the agent.
   * @param _opts - Optional parameters, reserved for future context (e.g., language).
   * @returns The generated response from the agent as a string.
   */
  async generate(userMessage: string, options?: { userLang?: string; [key: string]: unknown }): Promise<string> {
    let lang = options?.userLang
    if (!lang) {
      lang = detectLanguage(userMessage)
      this.logger.log(`Detected user language: ${lang}`)
    }
    this.logger.log(`Generating response for user message: "${userMessage}"`)

    try {
      const finalprompt = this.buildPrompt(userMessage, { userLang: lang })
      // If a tool-enabled agent is available, use it (requires chat_history placeholder)
      if (this.agentExecutor) {
        this.logger.debug('Using tool-enabled agent executor.')
        const result = await this.agentExecutor.invoke({
          input: finalprompt,
          chat_history: [],
        })

        this.logger.debug(`Agent executor result: ${JSON.stringify(result)}`)

        if (typeof result?.output === 'string') {
          this.logger.log('Agent executor returned output string.')
          return result.output
        }
        if (typeof result === 'string') {
          this.logger.log('Agent executor returned string directly.')
          return result
        }
        this.logger.warn('Agent executor returned a non-string result. Returning JSON stringified result.')
        return JSON.stringify(result)
      }

      // Fallback: build prompt using only system and user messages (no tools)
      this.logger.debug('No agent executor present. Using plain prompt with system and user messages.')
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', this.agentPrompt],
        ['user', '{input}'],
      ])
      const messages = await prompt.formatMessages({ input: userMessage })

      // Send formatted messages to the LLM
      const response = (await this.llm.invoke(messages)) as string | AIMessage | BaseMessage

      this.logger.debug(`Raw LLM response: ${JSON.stringify(response)}`)

      if (typeof response === 'string') {
        this.logger.log('LLM returned a string response.')
        return response
      }
      if (response && typeof (response as any).content === 'string') {
        this.logger.log('LLM returned a message object with content string.')
        return (response as any).content
      }

      this.logger.warn('LLM returned an unexpected response type. Returning JSON stringified response.')
      return JSON.stringify(response)
    } catch (error) {
      this.logger.error(
        `Error during agent response generation: ${error instanceof Error ? error.message : String(error)}`,
      )
      throw new Error('Failed to generate agent response. Please check logs for details.')
    }
  }

  /**
   * Instantiates the correct LLM provider (OpenAI, Anthropic, or Ollama) based on configuration.
   *
   * @param provider - The provider to instantiate.
   * @returns An LLM instance.
   */
  private instantiateLlm(provider: SupportedProviders) {
    switch (provider) {
      case 'anthropic':
        return new ChatAnthropic({
          apiKey: this.getOrThrow('ANTHROPIC_API_KEY'),
          modelName: this.config.get<string>('appConfig.anthropicModel') ?? 'claude-3',
        })
      case 'ollama':
        return new ChatOllama({
          baseUrl: this.config.get<string>('appConfig.ollamaBaseUrl') ?? 'http://ollama:11434',
          model: this.config.get<string>('appConfig.ollamaModel') ?? 'llama3',
        })
      case 'openai':
      default:
        return new ChatOpenAI({
          openAIApiKey: this.getOrThrow('OPENAI_API_KEY'),
          model: this.config.get<string>('appConfig.openaiModel') ?? 'gpt-4o',
        })
    }
  }

  /**
   * Builds the array of DynamicStructuredTool instances based on the TOOLS_CONFIG environment variable.
   * Each tool is validated, logged, and initialized with its own async function and error handling.
   *
   * @returns An array of DynamicStructuredTool instances, or an empty array if none are configured.
   */
  private buildTools() {
    const raw = this.config.get<string>('appConfig.toolsConfig')
    if (!raw) {
      this.logger.log('No TOOLS_CONFIG found – starting without tools.')
      return []
    }

    let defs: ExternalToolDef[]
    try {
      defs = JSON.parse(raw)
    } catch (e) {
      this.logger.error(`Invalid TOOLS_CONFIG JSON: ${e}`)
      return []
    }

    const querySchema = zod.object({
      query: zod.string().describe('Free-form query string passed to the external service.'),
    })

    // Map each tool definition to a DynamicStructuredTool instance
    return defs.map(
      (def) =>
        new (DynamicStructuredTool as any)({
          name: def.name,
          description: def.description,
          schema: querySchema,
          func: async ({ query }) => {
            // Log when the tool is called and the query/request sent
            this.logger.log(`[Tool:${def.name}] Called with query: "${query}"`)
            const url = def.endpoint.replace('{query}', encodeURIComponent(query))
            this.logger.log(`[Tool:${def.name}] Requesting URL: ${url}`)
            const res = await fetch(url, {
              method: def.method ?? 'GET',
              headers: def.authHeader ? { [def.authHeader]: def.authToken ?? '' } : undefined,
            })
            // Log the HTTP status and the first 300 chars of the response
            this.logger.log(`[Tool:${def.name}] HTTP status: ${res.status}`)
            if (!res.ok) {
              this.logger.error(`[Tool:${def.name}] Returned error: ${res.status}`)
              throw new Error(`External tool "${def.name}" returned ${res.status}`)
            }
            const text = await res.text()
            this.logger.log(`[Tool:${def.name}] Response body: ${text.slice(0, 300)}`)
            return text
          },
          returnDirect: false,
        }),
    )
  }

  /**
   * Sets up the tool-enabled agent executor using LangChain's agent API.
   * This enables dynamic tool-calling with prompt injection and logging.
   *
   * @param tools - Array of DynamicStructuredTool instances.
   */
  private async setupToolAgent(tools: any[]) {
    this.logger.debug(`***Agent prompt: ${this.agentPrompt}***`)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.agentPrompt],
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ])

    const agent = createToolCallingAgent({
      llm: this.llm as ChatOpenAI | ChatAnthropic,
      tools,
      prompt,
    })

    // Use dynamic import to avoid type recursion and runtime issues
    const { AgentExecutor } = await import('langchain/agents')
    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: this.config.get<boolean>('appConfig.agentVerbose') ?? false,
    }) as any
  }

  /**
   * Utility: Retrieves the required environment variable from ConfigService or process.env.
   * Throws an error if the variable is missing.
   *
   * @param envVar - The name of the environment variable.
   * @returns The string value of the variable.
   */
  private getOrThrow(envVar: string): string {
    const value = this.config.get<string>(envVar) ?? process.env[envVar]
    if (!value) throw new Error(`Environment variable ${envVar} is required.`)
    return value
  }

  /**
   * Builds the final prompt for the LLM using the agent prompt and user-specific options.
   * Ensures that if the user language is not English, the agent is instructed to respond in that language.
   *
   * @param userMessage - The user's input message to include in the prompt.
   * @param options - Optional parameters (e.g., userLang for the desired response language).
   * @returns The final prompt string to send to the LLM.
   */
  buildPrompt(userMessage: string, options?: { userLang?: string }): string {
    let prompt = this.agentPrompt
    // If the user language is not English, instruct the agent to answer in that language
    if (options?.userLang && options.userLang.toLowerCase() !== 'en') {
      prompt += ` Always respond in ${options.userLang}, unless told otherwise.`
      this.logger.debug(`Agent will answer in language: ${options.userLang}`)
    }
    // Combine the agent prompt and user message in a typical conversational format
    const finalPrompt = `${prompt}\nUser: ${userMessage}`
    this.logger.verbose(`Built prompt: ${finalPrompt}`)
    return finalPrompt
  }
}
