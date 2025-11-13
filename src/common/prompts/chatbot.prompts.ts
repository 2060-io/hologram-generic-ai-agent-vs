export const DEFAULT_CHATBOT_PROMPT_TEMPLATES: Record<
  string,
  (context: string, question: string, userName?: string) => string
> = {
  en: (context, question, userName) => `
  ${userName ? `You are speaking with ${userName}.\n\n` : ''}
  Use the following information as context to answer the user's question.
  Context:
  ${context}
  Question: ${question}
  Respond clearly and briefly in English.
  `,

  es: (context, question, userName) => `
  ${userName ? `Estás hablando con ${userName}.\n\n` : ''}
  Usa la siguiente información como contexto para responder la pregunta del usuario.
  Contexto:
  ${context}
  Pregunta: ${question}
  Responde de forma clara y breve en español.
  `,

  fr: (context, question, userName) => `
  ${userName ? `Vous parlez avec ${userName}.\n\n` : ''}
  Utilise les informations suivantes comme contexte pour répondre à la question de l'utilisateur.
  Contexte :
  ${context}
  Question : ${question}
  Réponds de manière claire et concise en français.
  `,
}

export const CHATBOT_PROMPT_TEMPLATES = DEFAULT_CHATBOT_PROMPT_TEMPLATES
