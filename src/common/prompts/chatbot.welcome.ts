/**
 * Multilanguage welcome message templates for the chatbot agent.
 * You can extend this map to support more languages.
 */
export const CHATBOT_WELCOME_TEMPLATES: Record<string, () => string> = {
  en: () =>
    `Hi there! 👋 I'm Holo, your smart assistant here at Hologram. I'm here to help you explore everything Verana and Hologram have to offer.`,

  es: () =>
    `¡Hola! 👋 Soy Holo, tu asistente inteligente en Hologram. Estoy aquí para ayudarte a descubrir todo lo que ofrecen Verana y Hologram.`,

  fr: () =>
    `Bonjour ! 👋 Je suis Holo, votre assistant intelligent sur Hologram. Je suis là pour vous aider à découvrir tout ce que Verana et Hologram ont à offrir.`,

  pt: () =>
    `Olá! 👋 Eu sou o Holo, seu assistente inteligente na Hologram. Estou aqui para te ajudar a explorar tudo que a Verana e a Hologram oferecem.`,
}
