/**
 * Default translations for the IA Agent.
 */
export const DEFAULT_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    ROOT_TITLE: 'Welcome!',
    LOGOUT: 'Logout',
    CREDENTIAL: 'Authenticate',
    WELCOME: 'Welcome! I am Agent, your smart agent.',
    LOGIN_REQUIRED: 'Please log in to continue.',
    AUTH_REQUIRED: 'Authentication is required to access this feature.',
    AUTH_SUCCESS: 'Authentication completed successfully. You can now access all features.',
    AUTH_SUCCESS_NAME: 'Authentication successful. Welcome, {name}! you can now access all features.',
    WAITING_CREDENTIAL: 'Waiting for you to complete the credential process...',
    AUTH_PROCESS_STARTED: 'Authentication process has started. Please respond to the credential request.',
    STATS_ERROR: 'Sorry, we could not retrieve your statistics at the moment.',
    ERROR_MESSAGES: 'The service is not available at the moment. Please try again later.',
  },
  es: {
    ROOT_TITLE: '¡Bienvenido!',
    LOGOUT: 'Cerrar sesión',
    CREDENTIAL: 'Autenticar',
    WELCOME: '¡Bienvenido! Soy Agent, tu agente inteligente.',
    AUTH_REQUIRED: 'Se requiere autenticación para acceder a esta función.',
    AUTH_SUCCESS: 'Autenticación completada con éxito. Ahora puedes acceder a todas las funciones.',
    AUTH_SUCCESS_NAME:
      'Autenticación completada con éxito. ¡Bienvenido, {name}! ahora puedes acceder a todas las funciones.',
    WAITING_CREDENTIAL: 'Esperando que completes el proceso de credencial...',
    AUTH_PROCESS_STARTED: 'El proceso de autenticación ha comenzado. Por favor, responde a la solicitud de credencial.',
    STATS_ERROR: 'Lo sentimos, no pudimos obtener tus estadísticas en este momento.',
    ERROR_MESSAGES: 'El servicio no está disponible en este momento. Por favor, intenta de nuevo más tarde.',
  },
  fr: {
    ROOT_TITLE: 'Bienvenue !',
    LOGOUT: 'Déconnexion',
    CREDENTIAL: 'Authentifier',
    WELCOME: 'Bienvenue ! Je suis Agent, votre agent intelligent.',
    AUTH_REQUIRED: "L'authentification est requise pour accéder à cette fonctionnalité.",
    AUTH_SUCCESS: 'Authentification réussie. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
    AUTH_SUCCESS_NAME:
      'Authentification réussie. Bienvenue, {name} ! Vous pouvez maintenant accéder à toutes les fonctionnalités.',
    WAITING_CREDENTIAL: "En attente de la fin du processus d'authentification...",
    AUTH_PROCESS_STARTED: "Le processus d'authentification a commencé. Veuillez répondre à la demande de justificatif.",
    STATS_ERROR: "Désolé, nous n'avons pas pu récupérer vos statistiques pour le moment.",
    ERROR_MESSAGES: "Le service n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
  },
}

export const TRANSLATIONS = DEFAULT_TRANSLATIONS
