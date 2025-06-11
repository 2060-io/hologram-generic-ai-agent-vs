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
import { SessionEntity } from 'src/core/models'
import { statisticsFetcherTool } from './tools/statistics-fetcher.tool'
import type { AgentExecutor } from 'langchain/agents'

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
  private agentExecutor: AgentExecutor | null = null
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
    this.logger.debug(`*** TOOLS: ${JSON.stringify(tools, null, 2)}`)
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
  async generate(userMessage: string, options?: { session?: SessionEntity }): Promise<string> {
    const session = options?.session
    this.logger.debug(`[generate] Initialize: ${JSON.stringify(session)}`)

    this.logger.log(`Generating response for user message: ${userMessage}`)
    try {
      // If a tool-enabled agent is available, use it (requires chat_history placeholder)
      if (this.agentExecutor) {
        this.logger.debug('Using tool-enabled agent executor.')

        const result = await this.agentExecutor.invoke(
          {
            input: { userMessage },
            chat_history: [],
          },
          {
            configurable: {
              isAuthenticated: session?.isAuthenticated ?? true,
            },
          },
        )

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
   * Builds the array of DynamicStructuredTool instances based on the LLM_TOOLS_CONFIG environment variable.
   * Each tool is validated, logged, and initialized with its own async function and error handling.
   * If a tool requires authentication (via the `requiresAuth` property), the tool will check
   * the current user's session and return an authentication message if not authenticated.
   *
   * @returns {DynamicStructuredTool[]} An array of DynamicStructuredTool instances, or an empty array if none are configured.
   */
  private buildTools() {
    const raw = this.config.get<string>('appConfig.llmToolsConfig')
    const dynamicTools: DynamicStructuredTool[] = []

    if (raw) {
      let defs: ExternalToolDef[]
      try {
        defs = JSON.parse(raw)
      } catch (e) {
        this.logger.error(`Invalid LLM_TOOLS_CONFIG JSON: ${e}`)
        defs = []
      }

      const querySchema = zod.object({
        query: zod.string().describe('Free-form query string passed to the external service.'),
        isAuthenticated: zod.boolean().describe('Authentication flag to restrict access.'),
      })

      dynamicTools.push(
        ...defs.map(
          (def) =>
            new DynamicStructuredTool({
              name: def.name,
              description: def.description,
              schema: querySchema,
              func: async ({ query }, _runManager, config) => {
                const isAuthenticated: boolean = config?.configurable?.isAuthenticated ?? false
                this.logger.debug(`[Tool] config: ${JSON.stringify(config)}`)
                this.logger.debug(`[Tool] isAuthenticated: ${isAuthenticated}`)
                // Check if this tool requires authentication and if the user is authenticated

                this.logger.debug(
                  `[DEBUG] isAuthenticated: ${JSON.stringify(isAuthenticated)} && requiresAuth ${JSON.stringify(def.requiresAuth)}`,
                )

                if (def.requiresAuth && !isAuthenticated) {
                  this.logger.debug(`[Tool:${def.name}] Attempted access without authentication.`)
                  return 'Authentication is required to access this feature. Please authenticate and try again.'
                }

                // Execute the tool normally (external API call)
                this.logger.log(`[Tool:${def.name}] Called with query: "${query}"`)
                const url = def.endpoint.replace('{query}', encodeURIComponent(query))
                this.logger.log(`[Tool:${def.name}] Requesting URL: ${url}`)
                const res = await fetch(url, {
                  method: def.method ?? 'GET',
                  headers: def.authHeader ? { [def.authHeader]: def.authToken ?? '' } : undefined,
                })
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
        ),
      )
    } else {
      this.logger.log('No LLM_TOOLS_CONFIG found – skipping dynamic tool loading.')
    }

    // Add static tool for statistics
    const staticTools = [statisticsFetcherTool]

    // Combine dynamic and static tools
    return [...dynamicTools, ...staticTools]
  }

  /**
   * Sets up the tool-enabled agent executor using LangChain's agent API.
   * This enables dynamic tool-calling with prompt injection and logging.
   *
   * @param tools - Array of DynamicStructuredTool instances.
   */
  private async setupToolAgent(tools: DynamicStructuredTool[]) {
    const today = new Date().toISOString().split('T')[0]

    const systemPrompt = `Today's date is: ${today}.\n${this.agentPrompt}`

    this.logger.debug(`***Agent prompt: ${systemPrompt}***`)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
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

  async detectLanguage(this: LlmService, text: string): Promise<string> {
    this.logger.debug(`[LLM LANG DETECT] Analyzing: "${text}"`)
    const prompt = `Detect the language of the following text. Only reply with the ISO 639-1 code (like "en", "es", "fr"). Text: ${text}`
    try {
      const response = (await this.llm.invoke([{ role: 'user', content: prompt }])) as string | AIMessage | BaseMessage

      let langCode: string | undefined
      if (typeof response === 'string') langCode = response.trim().toLowerCase()
      else if (response && typeof (response as any).content === 'string')
        langCode = (response as any).content.trim().toLowerCase()

      this.logger.debug(`[LLM LANG DETECT] Model replied: "${langCode}"`)
      // Extra check: Only accept if matches a real ISO code
      if (langCode && /^[a-z]{2}$/.test(langCode)) return langCode
      return 'en'
    } catch (err) {
      this.logger.error(`[LLM LANG DETECT] Error: ${err}`)
      return 'en'
    }
  }
}
