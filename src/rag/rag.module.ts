import { Module } from '@nestjs/common'
import { RagService } from './rag.service'
import { VectorStoreService } from './vector-store.service'
import { LangchainRagService } from './langchain-rag.service'
import { LangchainRagController } from './langchain-rag.controller'

@Module({
  providers: [RagService, VectorStoreService, LangchainRagService],
  exports: [RagService, LangchainRagService],
  controllers: [LangchainRagController],
})
export class RagModule {}
