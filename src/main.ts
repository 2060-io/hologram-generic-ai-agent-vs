import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { getLogLevels } from './config/logger.config'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'

async function bootstrap() {
  // Retrieve log levels based on environment configuration
  const logLevels = getLogLevels()

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  })

  const configService = app.get(ConfigService)
  const logger = new Logger(bootstrap.name)

  // Enable URI versioning for API routes
  app.enableVersioning({
    type: VersioningType.URI,
  })

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors()

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Chatbot IA API')
    .setDescription('API to interact with the AI ​​chatbot')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  // Get the application port from configuration
  const PORT = configService.get('appConfig.appPort')

  // Start the application and listen on the specified port
  await app.listen(PORT)

  // Retrieve application name and version from package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  const appName = packageJson.name
  const appVersion = packageJson.version

  // Log the URL where the application is running
  logger.log(`Application (${appName} v${appVersion}) running on: ${await app.getUrl()} `)
}
bootstrap()
