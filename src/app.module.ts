import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChatbotModule } from './chatbot/chatbot.module'
import { LlmModule } from './llm/llm.module'
import { RagModule } from './rag/rag.module'
import { IntegrationsModule } from './integrations/integrations.module'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [appConfig],
      isGlobal: true,
    }),
    ChatbotModule,
    LlmModule,
    RagModule,
    IntegrationsModule,
    ChatbotModule,
    LlmModule,
    RagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
