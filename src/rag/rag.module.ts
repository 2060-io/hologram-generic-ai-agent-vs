import { Module } from '@nestjs/common'
import { RagService } from './rag.service'
import { VectorStoreService } from './vector-store.service'
import { LangchainRagService } from './langchain-rag.service'

@Module({
  providers: [RagService, VectorStoreService, LangchainRagService],
  exports: [RagService, LangchainRagService],
})
export class RagModule {}
