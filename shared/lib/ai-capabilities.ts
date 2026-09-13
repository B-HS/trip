import 'server-only'
import type { Env } from '@/shared/lib/env'
import { getEnv } from '@/shared/lib/env'

const ENCRYPTION_KEY_BYTES = 32

type AiCapabilityEnv = Pick<Env, 'APP_ENCRYPTION_KEY'>

/**
 * Checks the one process-level prerequisite for user-owned AI providers.
 * Provider API keys are stored per user and must not be required in process env.
 */
export const isAiEncryptionKeyValid = (value: string | undefined): value is string => {
    if (!value) return false

    try {
        return Buffer.from(value, 'base64').length === ENCRYPTION_KEY_BYTES
    } catch {
        return false
    }
}

export const getAiCapabilities = (env: AiCapabilityEnv) => ({
    ai: isAiEncryptionKeyValid(env.APP_ENCRYPTION_KEY),
})

/** Server-only capability check for all AI UI and server entry points. */
export const isAiCapabilityEnabled = () => {
    try {
        return getAiCapabilities(getEnv()).ai
    } catch {
        return false
    }
}
