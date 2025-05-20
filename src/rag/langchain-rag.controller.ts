import { Controller, Post, Body } from '@nestjs/common'
import { LangchainRagService } from './langchain-rag.service'

@Controller('langchain-rag')
export class LangchainRagController {
  constructor(private readonly ragService: LangchainRagService) {}

  @Post('add-doc')
  async addDoc(@Body() body: { id: string; text: string }) {
    await this.ragService.addDocument(body.id, body.text)
    return { status: 'ok' }
  }

  @Post('ask')
  async ask(@Body() body: { question: string }) {
    const answer = await this.ragService.askWithRag(body.question)
    return { answer }
  }
}
