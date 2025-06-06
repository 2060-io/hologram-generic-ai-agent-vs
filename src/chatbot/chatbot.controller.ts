import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChatbotService } from './chatbot.service'
import { AskDto } from './dto/chatbot.dts'
import { SessionEntity } from 'src/core/models'

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  async ask(@Body() askDto: AskDto) {
    const { userInput, connectionId, lang, isAuthenticated, userName, state } = askDto

    const session = {
      connectionId,
      lang,
      isAuthenticated,
      userName,
      state,
    } as SessionEntity

    const answer = await this.chatbotService.chat({ userInput, session })
    return { answer }
  }
}
