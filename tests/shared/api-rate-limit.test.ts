import { describe, expect, test } from 'bun:test'
import { rateLimitBucket, rateLimitValue } from '@/shared/lib/api-rate-limit'

describe('developer API rate limits', () => {
    test('tracks separate read and write buckets', () => {
        expect(rateLimitBucket('GET')).toBe('read')
        expect(rateLimitBucket('POST')).toBe('write')
        expect(rateLimitValue('read')).toBe(60)
        expect(rateLimitValue('write')).toBe(20)
    })
})
