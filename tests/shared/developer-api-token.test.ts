import { describe, expect, test } from 'bun:test'
import { API_TOKEN_PREFIX } from '@/shared/constant/developer-api'
import { compareApiTokenHash, createApiTokenValue, hashApiToken, tokenMetadata } from '@/shared/lib/developer-api-token'

describe('developer API token primitives', () => {
    test('creates opaque high entropy tokens and stable display metadata', () => {
        const token = createApiTokenValue()
        expect(token.startsWith(API_TOKEN_PREFIX)).toBe(true)
        expect(token.length).toBeGreaterThan(45)
        const metadata = tokenMetadata(token)
        expect(`${metadata.tokenPrefix}…${metadata.tokenLast4}`).toContain(token.slice(-4))
        expect(metadata.tokenLast4).toHaveLength(4)
    })

    test('hash comparison accepts only the exact token', () => {
        const token = createApiTokenValue()
        const digest = hashApiToken(token)
        expect(compareApiTokenHash(token, digest)).toBe(true)
        expect(compareApiTokenHash(`${token}x`, digest)).toBe(false)
        expect(compareApiTokenHash(token, digest.slice(0, -2))).toBe(false)
    })
})
