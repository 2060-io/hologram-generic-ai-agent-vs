import { Global, Module } from '@nestjs/common'
import { SessionEntity } from './models'
import { CoreService } from './core.service'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConnectionEntity } from '@2060.io/service-agent-nestjs-client'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChatbotModule } from 'src/chatbot/chatbot.module'
import { MemoryModule } from 'src/memory/memory.module'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectionEntity, SessionEntity]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configService.get<string>('appConfig.postgresHost'),
        port: 5432,
        username: configService.get<string>('appConfig.postgresUser'),
        password: configService.get<string>('appConfig.postgresPassword'),
        database: configService.get<string>('appConfig.postgresDbName'),
        entities: [ConnectionEntity, SessionEntity],
        synchronize: true,
        ssl: false,
        logging: false,
        retryAttempts: 10,
        retryDelay: 2000,
      }),
      inject: [ConfigService],
    }),
    ChatbotModule,
    MemoryModule,
  ],
  controllers: [],
  providers: [CoreService],
  exports: [TypeOrmModule, CoreService],
})
export class CoreModule {}
