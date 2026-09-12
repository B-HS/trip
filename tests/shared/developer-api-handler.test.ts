import { describe, expect, test } from 'bun:test'
import {
    API_REQUEST_BODY_MAX_BYTES,
    etagForUpdatedAt,
    parseJson,
    parsePage,
    requireConfirmation,
    requireIfMatch,
} from '@/shared/lib/developer-api-handler'

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

    test('caps chunked request bodies without buffering the entire stream', async () => {
        const encoder = new TextEncoder()
        const validChunks = ['{"title":"', 'Kyoto"}'].map((chunk) => encoder.encode(chunk))
        const validRequest = new Request('https://trip.test', {
            method: 'POST',
            body: new ReadableStream({
                start(controller) {
                    for (const chunk of validChunks) controller.enqueue(chunk)
                    controller.close()
                },
            }),
            duplex: 'half',
        } as RequestInit & { duplex: 'half' })
        expect(validRequest.headers.get('content-length')).toBeNull()
        await expect(parseJson(validRequest)).resolves.toEqual({ title: 'Kyoto' })

        const oversized = encoder.encode(JSON.stringify({ value: 'x'.repeat(API_REQUEST_BODY_MAX_BYTES) }))
        const oversizedRequest = new Request('https://trip.test', {
            method: 'POST',
            body: new ReadableStream({
                start(controller) {
                    controller.enqueue(oversized.subarray(0, 17))
                    controller.enqueue(oversized.subarray(17))
                    controller.close()
                },
            }),
            duplex: 'half',
        } as RequestInit & { duplex: 'half' })
        await expect(parseJson(oversizedRequest)).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' })
    })
})
