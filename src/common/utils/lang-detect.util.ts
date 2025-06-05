import { Logger } from '@nestjs/common'
import { detectOne } from 'langdetect'

/**
 * Detects the language code (ISO 639-1) for a given text using langdetect.
 * Defaults to 'en' (English) if detection is uncertain.
 * Uses NestJS Logger for consistent logging.
 *
 * @param text - The text to analyze
 * @returns The detected language code (e.g. 'en', 'es', 'fr', etc.)
 */
export function detectLanguage(text: string): string {
  const logger = new Logger('detectLanguage')

  try {
    // Log the input text
    logger.debug(`Input text: "${text}"`)

    const lang = detectOne(text)

    // Log the detected language
    logger.log(`Detected language: ${lang}`)

    if (typeof lang === 'string') {
      return lang
    }
    // Log fallback case
    logger.warn('Fallback to "en" (language not a string)')
    return 'en'
  } catch (error) {
    logger.error(`Error detecting language: ${error instanceof Error ? error.message : String(error)}`)
    return 'en'
  }
}
