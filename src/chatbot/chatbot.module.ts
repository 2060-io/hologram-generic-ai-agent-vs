import { Module } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotController } from './chatbot.controller'
import { RagModule } from 'src/rag/rag.module'
import { LlmModule } from 'src/llm/llm.module'
import { MemoryModule } from '../memory/memory.module'

@Module({
  imports: [RagModule, LlmModule, MemoryModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
  exports: [ChatbotService],
})
export class ChatbotModule {}
