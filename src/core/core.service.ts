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
import { EventHandler } from '@2060.io/service-agent-nestjs-client'
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
import { TRANSLATIONS } from './common/i18n/i18n'
import { text } from 'stream/consumers'

@Injectable()
export class CoreService implements EventHandler, OnModuleInit {
  private readonly apiClient: ApiClient
  private readonly logger = new Logger(CoreService.name)

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    private readonly configService: ConfigService,
    private readonly chatBotService: ChatbotService,
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
    const { connectionId } = session
    switch (session.state) {
      case StateStep.CHAT:
        if (selectionId === Cmd.LOGOUT) {
          //Clear Sessions
          this.closeConnection(connectionId)
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
    try {
      //TODO: use chatbot servide
      switch (session.state) {
        case StateStep.START:
          await this.sendText(connectionId, this.getText('LOGIN_REQUIRED', userLang), userLang)
          await this.sendContextualMenu(session)
          session.state = StateStep.AUTH
        case StateStep.CHAT:
          // Call LLM to get response
          this.logger.debug(`New Message ${content}`)
          const answer = await this.chatBotService.chat({ content, connectionId, userLang })
          this.logger.debug(`LLM generated answer: "${answer}"`)
          this.sendText(connectionId, answer, userLang)
          break
        case StateStep.AUTH:
          // Request Credential ...
          const credentialDefinitionId = this.configService.get<string>('appConfig.credentialDefinitionId')

          if (!credentialDefinitionId) {
            throw new Error('Missing config: appConfig.credentialDefinitionId')
          }

          const body = new IdentityProofRequestMessage({
            connectionId,
            requestedProofItems: [],
          })
          const requestedProofItem = new VerifiableCredentialRequestedProofItem({
            id: '1',
            type: 'verifiable-credential',
            credentialDefinitionId,
          })
          body.requestedProofItems.push(requestedProofItem)
          await this.apiClient.messages.send(body)

          if (content.type === CredentialReceptionMessage.type) {
            content.state === 'done' &&
              (await this.sendText(
                connectionId,
                `For revocation, please provide the thread ID: ${content.threadId}`,
                userLang,
              ))
            session.state = StateStep.CHAT
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
        state: StateStep.START,
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

  // send special flows
  private async sendContextualMenu(session: SessionEntity): Promise<SessionEntity> {
    const item: ContextualMenuItem[] = []
    switch (session.state) {
      case StateStep.START:
        new ContextualMenuItem({
          id: Cmd.AUTHENTICATE,
          title: this.getText('CREDENTIAL', session.lang),
        })
        break
      case StateStep.CHAT:
        item.push(
          new ContextualMenuItem({
            id: Cmd.LOGOUT,
            title: this.getText('LOGOUT', session.lang),
          }),
        )
        break
      default:
        break
    }

    await this.apiClient.messages.send(
      new ContextualMenuUpdateMessage({
        title: this.getText('ROOT_TITLE', session.lang),
        connectionId: session.connectionId,
        options: item,
        timestamp: new Date(),
      }),
    )
    return await this.sessionRepository.save(session)
  }
}
