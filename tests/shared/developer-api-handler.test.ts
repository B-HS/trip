import { describe, expect, test } from 'bun:test'
import { etagForUpdatedAt, parsePage, requireConfirmation, requireIfMatch } from '@/shared/lib/developer-api-handler'

describe('developer API request safety helpers', () => {
    test('strictly validates pagination values', () => {
        expect(parsePage(new Request('https://trip.test/api/v1/trips?page=2&page_size=50'))).toEqual({ page: 2, pageSize: 50 })
        expect(() => parsePage(new Request('https://trip.test/api/v1/trips?page=2.5'))).toThrow()
        expect(() => parsePage(new Request('https://trip.test/api/v1/trips?page_size=101'))).toThrow()
    })

    test('requires explicit confirmation and the current ETag', () => {
        const updatedAt = '2026-09-12T00:00:00.000Z'
        const request = new Request('https://trip.test', { headers: { 'x-trip-confirm': 'delete', 'if-match': etagForUpdatedAt(updatedAt) } })
        expect(() => requireConfirmation(request, 'delete')).not.toThrow()
        expect(() => requireIfMatch(request, updatedAt)).not.toThrow()
        expect(() => requireConfirmation(new Request('https://trip.test'), 'delete')).toThrow()
        expect(() => requireIfMatch(new Request('https://trip.test'), updatedAt)).toThrow()
    })
})
