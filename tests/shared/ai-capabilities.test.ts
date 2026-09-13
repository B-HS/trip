import { describe, expect, test } from 'bun:test'
import { getAiCapabilities, isAiEncryptionKeyValid } from '@/shared/lib/ai-capabilities'

const validKey = Buffer.alloc(32, 7).toString('base64')

describe('AI capability', () => {
    test('requires only the process encryption key, not user-owned provider keys', () => {
        expect(getAiCapabilities({ APP_ENCRYPTION_KEY: undefined })).toEqual({ ai: false })
        expect(getAiCapabilities({ APP_ENCRYPTION_KEY: validKey })).toEqual({ ai: true })
    })

    test('rejects absent and incorrectly sized encryption keys', () => {
        expect(isAiEncryptionKeyValid(undefined)).toBe(false)
        expect(isAiEncryptionKeyValid('not-a-key')).toBe(false)
        expect(isAiEncryptionKeyValid(Buffer.alloc(31, 7).toString('base64'))).toBe(false)
        expect(isAiEncryptionKeyValid(validKey)).toBe(true)
    })
})
