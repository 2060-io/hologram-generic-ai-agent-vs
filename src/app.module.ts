import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChatbotModule } from './chatbot/chatbot.module'
import { LlmModule } from './llm/llm.module'
import { RagModule } from './rag/rag.module'
import { IntegrationsModule } from './integrations/integrations.module'
import { EventsModule } from '@2060.io/service-agent-nestjs-client'
import appConfig from './config/app.config'
import { CoreService } from './core/core.service'
import { CoreModule } from './core/core.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [appConfig],
      isGlobal: true,
    }),
    CoreModule,
    ChatbotModule,
    LlmModule,
    RagModule,
    IntegrationsModule,
    ChatbotModule,
    LlmModule,
    RagModule,
    EventsModule.register({
      modules: {
        messages: true,
        connections: true,
      },
      options: {
        eventHandler: CoreService,
        url: process.env.SERVICE_AGENT_ADMIN_URL,
        imports: [LlmModule],
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
