import { beforeEach, describe, expect, test } from 'bun:test'
import { clearDeveloperApiRateLimit, checkDeveloperApiRateLimit } from '@/shared/lib/api-rate-limit'

describe('developer API rate limits', () => {
    beforeEach(() => clearDeveloperApiRateLimit())

    test('tracks separate read and write buckets', () => {
        expect(checkDeveloperApiRateLimit('token', 'GET').remaining).toBe(59)
        expect(checkDeveloperApiRateLimit('token', 'POST').remaining).toBe(19)
    })
})
