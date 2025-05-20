import { detectOne } from 'langdetect'

/**
 * Detects the language code (ISO 639-1) for a given text using langdetect.
 * Defaults to 'en' (English) if detection is uncertain.
 * @param text The text to analyze
 * @returns The detected language code (e.g. 'en', 'es', 'fr', etc.)
 */
export function detectLanguage(text: string): string {
  try {
    // Log the input text
    console.log('[detectLanguage] Input text:', text)

    const lang = detectOne(text)

    // Log the detected language
    console.log('[detectLanguage] Detected lang:', lang)

    if (typeof lang === 'string') {
      return lang
    }
    // Log fallback
    console.warn('[detectLanguage] Fallback to "en" (lang not a string)')
    return 'en'
  } catch (error) {
    console.error('[detectLanguage] Error:', error)
    return 'en'
  }
}
