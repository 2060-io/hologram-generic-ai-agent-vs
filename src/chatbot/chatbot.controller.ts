import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChatbotService } from './chatbot.service'
import { AskDto } from './dto/chatbot.dts'

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  async ask(@Body() askDto: AskDto) {
    const { userInput, connectionId } = askDto
    const answer = await this.chatbotService.chat({ userInput, connectionId })
    return { answer }
  }
}
