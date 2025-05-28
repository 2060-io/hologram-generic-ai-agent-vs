import { CredentialReceptionMessage } from '@2060.io/service-agent-model'

export function isCredentialReceptionMessage(obj: unknown): obj is CredentialReceptionMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'state' in obj &&
    (obj as { type?: unknown }).type === CredentialReceptionMessage.type &&
    (obj as { state?: unknown }).state === 'done'
  )
}
