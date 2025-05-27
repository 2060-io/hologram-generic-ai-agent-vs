import {
  BaseMessage,
  Claim,
  ContextualMenuItem,
  ContextualMenuSelectMessage,
  ContextualMenuUpdateMessage,
  CredentialReceptionMessage,
  CredentialRequestMessage,
  IdentityProofRequestMessage,
  MediaMessage,
  ProfileMessage,
  TextMessage,
  VerifiableCredentialRequestedProofItem,
} from '@2060.io/service-agent-model'
import { ApiClient, ApiVersion } from '@2060.io/service-agent-client'
import { CredentialService, EventHandler, StatEventOptions } from '@2060.io/service-agent-nestjs-client'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { SessionEntity } from './models'
import { JsonTransformer } from '@credo-ts/core'
import { Cmd } from './common'
import { Repository } from 'typeorm'
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { StateStep } from './common/enums/state-step.enum'
import { CHATBOT_WELCOME_TEMPLATES } from '../common/prompts/chatbot.welcome'
import { ChatbotService } from '../chatbot/chatbot.service'
import { TRANSLATIONS, AUTH_KEYWORDS_BY_LANG } from './common/i18n/i18n'

@Injectable()
export class CoreService implements EventHandler, OnModuleInit {
  private readonly apiClient: ApiClient
  private readonly logger = new Logger(CoreService.name)

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    private readonly configService: ConfigService,
    private readonly chatBotService: ChatbotService,
    private readonly credentialService: CredentialService,
  ) {
    const baseUrl = configService.get<string>('appConfig.serviceAgentAdminUrl') || 'http://localhost:3001'
    this.apiClient = new ApiClient(baseUrl, ApiVersion.V1)
  }

  async onModuleInit() {}

  /**
   * Handles incoming messages and manages the input flow.
   * Routes the message to the appropriate handler based on its type.
   *
   * @param message - The incoming message to process.
   */
  async inputMessage(message: BaseMessage): Promise<void> {
    let content
    let inMsg
    let session: SessionEntity
    session = await this.handleSession(message.connectionId)

    try {
      this.logger.debug('inputMessage: ' + JSON.stringify(message))

      switch (message.type) {
        case TextMessage.type:
          content = JsonTransformer.fromJSON(message, TextMessage)
          //entry message user to chatbot agent service ,send session connection
          break
        case ContextualMenuSelectMessage.type:
          inMsg = JsonTransformer.fromJSON(message, ContextualMenuSelectMessage)
          await this.handleContextualAction(inMsg.selectionId, session)
          break
        case MediaMessage.type:
          inMsg = JsonTransformer.fromJSON(message, MediaMessage)
          content = 'media'
          break
        case ProfileMessage.type:
          inMsg = JsonTransformer.fromJSON(message, ProfileMessage)
          session.lang = inMsg.preferredLanguage
          //Send Welcome Message
          await this.welcomeMessage(session.connectionId)
          break
        case CredentialReceptionMessage.type:
          content = JsonTransformer.fromJSON(message, CredentialReceptionMessage)
          break
        default:
          break
      }

      if (content != null) {
        if (typeof content === 'string') content = content.trim()
        if (content.length === 0) content = null
      }
    } catch (error) {
      this.logger.error(`inputMessage: ${error}`)
    }
    await this.handleStateInput(content, session)
  }

  /**
   * Handles the `ConnectionStateUpdated` event for establishing a new connection.
   *
   * @param event - The event containing connection update details.
   */
  async newConnection(connectionId: string): Promise<void> {
    const session = await this.handleSession(connectionId)
    await this.sendContextualMenu(session)
  }

  /**
   * Handles the `ConnectionStateUpdated` event to close an active connection.
   *
   * This method is part of the event handler implementation for managing
   * connection lifecycle events. It ensures that the session associated with
   * the given connection is updated and purged of sensitive or user-specific data
   * before finalizing the connection closure.
   *
   * Steps:
   * 1. Retrieves the session associated with the `connectionId` from the event.
   * 2. Purges user-specific data from the session using `purgeUserData`,
   *    resetting the session state and clearing sensitive fields.
   *
   * @param event - The `ConnectionStateUpdated` event containing details of
   *                the connection to be closed (e.g., `connectionId`).
   *
   * @returns {Promise<void>} - Resolves when the connection is successfully closed
   *                            and the session is updated.
   *
   * @note This method ensures that the session's `connectionId` and other essential
   *       metadata remain intact while cleaning up unnecessary or sensitive data.
   */
  async closeConnection(connectionId: string): Promise<void> {
    const session = await this.handleSession(connectionId)
    await this.purgeUserData(session)
  }

  private async welcomeMessage(connectionId: string) {
    const userLang = (await this.handleSession(connectionId)).lang

    const welcomeMessage = CHATBOT_WELCOME_TEMPLATES[userLang]?.() ?? CHATBOT_WELCOME_TEMPLATES['en']()
    this.logger.debug(`LLM generated answer: "${welcomeMessage}"`)
    this.sendText(connectionId, welcomeMessage, userLang)
  }

  /**
   * Sends a text message to a specific connection.
   *
   * @param connectionId - Identifier of the target connection.
   * @param text - The content of the message.
   * @param lang - The language of the message.
   */
  private async sendText(connectionId: string, text: string, lang: string) {
    await this.apiClient.messages.send(
      new TextMessage({
        connectionId: connectionId,
        content: this.getText(text, lang),
      }),
    )
  }

  /**
   * Retrieves localized text for the given key and language.
   *
   * @param text - The key for the desired text.
   * @param lang - The language of the text.
   */
  private getText(key: string, lang: string): string {
    const messages = TRANSLATIONS[lang] || TRANSLATIONS['en']
    return messages[key] || key
  }

  /**
   * Processes actions related to `ContextualMenuSelectMessage` messages.
   * Updates the session based on the selected option.
   *
   * @param selectionId - Identifier of the user's selection.
   * @param session - The current session associated with the message.
   */
  private async handleContextualAction(selectionId: string, session: SessionEntity): Promise<SessionEntity> {
    const { connectionId, lang } = session
    switch (session.state) {
      case StateStep.CHAT:
        if (selectionId === Cmd.AUTHENTICATE) {
          const credentialDefinitionId = this.configService.get<string>('appConfig.credentialDefinitionId')
          if (!credentialDefinitionId) {
            throw new Error('Missing config: appConfig.credentialDefinitionId')
          }

          const proofRequest = new IdentityProofRequestMessage({
            connectionId,
            requestedProofItems: [
              new VerifiableCredentialRequestedProofItem({
                id: '1',
                type: 'verifiable-credential',
                credentialDefinitionId,
              }),
            ],
          })

          await this.apiClient.messages.send(proofRequest)

          session.state = StateStep.AUTH
          this.logger.debug(`[AUTH] Proof request sent to ${connectionId}`)
          await this.sendText(connectionId, this.getText('AUTH_PROCESS_STARTED', lang), lang)
        }

        if (selectionId === Cmd.LOGOUT) {
          session.isAuthenticated = false
          await this.sessionRepository.save(session)
          await this.closeConnection(connectionId)
        }
        break
      default:
        break
    }
    return await this.sessionRepository.save(session)
  }

  /**
   * Handles message input using a state machine.
   * Determines the next session state based on the message content.
   *
   * @param content - The content of the message.
   * @param session - The active session to update.
   */
  private async handleStateInput(content: any, session: SessionEntity): Promise<SessionEntity> {
    const { id, connectionId, state, lang: userLang } = session
    this.logger.debug(`New Message ${JSON.stringify(content)}`)
    try {
      switch (session.state) {
        case StateStep.CHAT:
          if (content?.content) {
            const lower = content.content.toLowerCase()
            const keywords = AUTH_KEYWORDS_BY_LANG[userLang] || []

            this.logger.debug(`[CHAT] User input: "${lower}"`)
            this.logger.debug(`[CHAT] Keywords for lang "${userLang}": ${JSON.stringify(keywords)}`)

            const needsAuth = keywords.some((k) => lower.includes(k))
            this.logger.debug(`[CHAT] needsAuth=${needsAuth}, isAuthenticated=${session.isAuthenticated}`)

            if (needsAuth) {
              if (!session.isAuthenticated) {
                await this.sendText(connectionId, this.getText('AUTH_REQUIRED', userLang), userLang)
                break
              }

              const stats = await this.getStats(session)
              await this.sendText(connectionId, stats, userLang)
              break
            }

            const answer = await this.chatBotService.chat({ userInput: content.content, connectionId, userLang })
            await this.sendText(connectionId, answer, userLang)
          }
          break
        case StateStep.AUTH:
          if (content?.type === CredentialReceptionMessage.type && content.state === 'done') {
            session.isAuthenticated = true
            session.state = StateStep.CHAT
            this.logger.debug(`[AUTH] User ${connectionId} authenticated successfully.`)
            await this.sendText(connectionId, this.getText('AUTH_SUCCESS', userLang), userLang)
          } else {
            await this.sendText(connectionId, this.getText('WAITING_CREDENTIAL', userLang), userLang)
          }
          break
        default:
          break
      }
    } catch (error) {
      this.logger.error('handleStateInput: ' + error)
    }
    return await this.sendContextualMenu(session)
  }

  /**
   * Retrieves or initializes the session associated with a specific connection.
   * Ensures consistent and secure operations.
   *
   * @param connectionId - Identifier of the active connection.
   */
  private async handleSession(connectionId: string): Promise<SessionEntity> {
    let session = await this.sessionRepository.findOneBy({
      connectionId: connectionId,
    })
    this.logger.debug('handleSession session: ' + JSON.stringify(session))

    if (!session) {
      session = this.sessionRepository.create({
        connectionId: connectionId,
        state: StateStep.CHAT,
      })

      await this.sessionRepository.save(session)
      this.logger.debug('New session: ' + JSON.stringify(session))
    }
    return await this.sessionRepository.save(session)
  }

  // Special flows
  /**
   * Purges user-specific data from the provided session.
   *
   * This method resets the session's `state` to `StateStep.START` and ensures that
   * any additional parameters in the session (user-specific or sensitive data)
   * are set to `null`. It updates the session in the database, keeping the
   * `connectionId`, `id`, `lang`, and timestamps intact.
   *
   * @param session - The session entity to be purged.
   *                  It must be a valid session retrieved from the database.
   *
   * @returns {Promise<SessionEntity>} - The updated session entity after the purge.
   *
   * @note This method should be used to reset a session to its initial state
   *       while preserving its connection details and essential metadata.
   */
  private async purgeUserData(session: SessionEntity): Promise<SessionEntity> {
    session.state = StateStep.START
    // Additional sensitive data can be reset here if needed.
    return await this.sessionRepository.save(session)
  }

  private async sendContextualMenu(session: SessionEntity): Promise<SessionEntity> {
    const options: ContextualMenuItem[] = []
    if (!session.isAuthenticated) {
      options.push(new ContextualMenuItem({ id: Cmd.AUTHENTICATE, title: this.getText('CREDENTIAL', session.lang) }))
    } else {
      options.push(new ContextualMenuItem({ id: Cmd.LOGOUT, title: this.getText('LOGOUT', session.lang) }))
    }

    const title =
      session.isAuthenticated && session.userName
        ? `${this.getText('ROOT_TITLE', session.lang)} ${session.userName}!`
        : this.getText('ROOT_TITLE', session.lang)

    await this.apiClient.messages.send(
      new ContextualMenuUpdateMessage({
        title,
        connectionId: session.connectionId,
        options,
        timestamp: new Date(),
      }),
    )
    return await this.sessionRepository.save(session)
  }

  private async getStats(session: SessionEntity): Promise<string> {
    const { lang: userLang, connectionId } = session

    try {
      //TODO: define parameters to
      const statsData = '' //TODO: connect with vs-agent stat

      const prompt = `You are an assistant that helps users understand their chatbot statistics in a friendly way.  
                      Here is the raw data:
                      ${JSON.stringify(statsData)}  
                      Please summarize and explain what this means in a helpful and simple manner,
                      in ${userLang === 'es' ? 'Spanish' : userLang === 'fr' ? 'French' : 'English'}.`

      const summary = await this.chatBotService.chat({
        userInput: prompt,
        connectionId,
        userLang,
      })

      return summary
    } catch (err) {
      this.logger.error(`[STATS] Error generating explanation: ${err}`)
      return this.getText('STATS_ERROR', userLang)
    }
  }
}
