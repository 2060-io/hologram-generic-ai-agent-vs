import { Module } from '@nestjs/common'
import { RagModule } from 'src/rag/rag.module'
import { MemoryModule } from 'src/memory/memory.module'
import { LlmService } from './llm.service'

@Module({
  imports: [RagModule, MemoryModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
