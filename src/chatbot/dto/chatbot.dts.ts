import { IsString } from 'class-validator'

/**
 * Data Transfer Object for chatbot 'ask' requests.
 * Represents the structure of the input payload when a user asks a question.
 */
export class AskDto {
  /**
   * The user's question or message for the chatbot.
   * @example "What is the weather like today?"
   */
  @IsString()
  userInput: string

  /**
   * Unique identifier for the current chat session or user connection.
   * Used to maintain state and memory per user.
   * @example "01XJ84GH"
   */
  @IsString()
  connectionId: string
}
