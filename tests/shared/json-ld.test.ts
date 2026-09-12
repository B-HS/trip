import { describe, expect, test } from 'bun:test'
import { buildArticleJsonLd, buildQaPageJsonLd, buildTouristTripJsonLd, serializeJsonLd } from '@/shared/lib/json-ld'

const trip = {
    title: 'Kyoto <script>alert(1)</script>',
    destination: 'Kyoto',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    periodNote: null,
    customNights: null,
    customDays: null,
    days: [{ id: 'day-1', title: 'Arrival', date: '2026-04-01', overview: 'Arrive' }],
    destinations: [{ id: 'destination-1', countryCode: 'JP', city: 'Kyoto' }],
    flights: [],
    lodgings: [],
} as Record<string, unknown>

describe('JSON-LD builders', () => {
    test('escapes HTML-sensitive characters before script injection', () => {
        const serialized = serializeJsonLd({ description: '</script><script>alert(1)</script>' })

        expect(serialized).not.toContain('</script>')
        expect(serialized).toContain('\\u003c/script\\u003e')
    })

    test('builds a tourist itinerary with structured destinations and days', () => {
        const result = buildTouristTripJsonLd(trip as never, 'https://trip.gumyo.net/s/kyoto')

        expect(result['@type']).toBe('TouristTrip')
        expect((result.itinerary as { itemListElement: unknown[] }).itemListElement).toHaveLength(1)
        expect(result.touristDestination).toBeDefined()
        expect(result).not.toHaveProperty('accommodation')
        expect(result).not.toHaveProperty('subjectOf')
    })

    test('uses TouristTrip departure and arrival time properties from flights', () => {
        const result = buildTouristTripJsonLd(
            {
                ...trip,
                flights: [
                    { direction: 'outbound', departTime: '09:30', arriveTime: '11:00', departCode: 'ICN', arriveCode: 'KIX' },
                    { direction: 'inbound', departTime: '14:00', arriveTime: '16:00', departCode: 'KIX', arriveCode: 'ICN' },
                ],
            } as never,
            'https://trip.gumyo.net/s/kyoto',
        )

        expect(result.departureTime).toBe('2026-04-01T09:30:00')
        expect(result.arrivalTime).toBe('2026-04-05T16:00:00')
    })

    test('uses Article for posts and QAPage only for questions', () => {
        const post = {
            title: 'Where should I stay?',
            excerpt: 'Looking for a central hotel.',
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            commentCount: 0,
            author: { name: 'Traveler', username: 'traveler' },
        } as never

        expect(buildArticleJsonLd(post, 'https://trip.gumyo.net/boards/qna/post')['@type']).toBe('Article')
        expect(buildQaPageJsonLd(post, 'https://trip.gumyo.net/boards/qna/post').mainEntity).toMatchObject({ '@type': 'Question' })
    })
})
