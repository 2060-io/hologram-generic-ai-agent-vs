/**
 * Multilanguage prompt templates for the chatbot agent.
 * You can extend this map to support more languages.
 */
export const CHATBOT_PROMPT_TEMPLATES: Record<string, (context: string, question: string) => string> = {
  en: (context, question) => `
  Use the following information as context to answer the user's question.
  Context:
  ${context}
  Question: ${question}
  Respond clearly and briefly in English.
  `,

  es: (context, question) => `
  Usa la siguiente información como contexto para responder la pregunta del usuario.
  Contexto:
  ${context}
  Pregunta: ${question}
  Responde de forma clara y breve en español.
  `,

  fr: (context, question) => `
  Utilise les informations suivantes comme contexte pour répondre à la question de l'utilisateur.
  Contexte :
  ${context}
  Question : ${question}
  Réponds de manière claire et concise en français.
  `,
}

