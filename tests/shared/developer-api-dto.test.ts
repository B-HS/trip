import { expect, test } from 'bun:test'
import { toDeveloperTripDetail } from '@/shared/lib/developer-api-dto'

test('developer trip DTO exposes a stable OpenAPI-shaped detail', () => {
    const dto = toDeveloperTripDetail({
        id: 'trip-1',
        ownerId: 'user-1',
        title: 'Kyoto',
        eyebrow: null,
        destination: 'Kyoto',
        departureAirportCode: 'ICN',
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        customNights: null,
        customDays: null,
        periodNote: null,
        disclaimer: null,
        verifiedOn: null,
        bufferPolicy: null,
        bookingNote: null,
        footerNote: null,
        sidebarNote: null,
        shareSlug: null,
        isPublic: false,
        likeCount: 0,
        revision: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        owner: { id: 'user-1', name: 'Traveler', username: null, image: null },
        destinations: [{ id: 'destination-1', tripId: 'trip-1', countryCode: 'JP', city: 'Kyoto', sortOrder: 0 }],
        flights: [],
        lodgings: [],
        sidebarLinks: [],
        scheduleKinds: [],
        days: [],
        bookings: [],
        infoSections: [],
    } as never)

    expect(dto).toMatchObject({ id: 'trip-1', revision: 3, destinations: [{ countryCode: 'JP', city: 'Kyoto', orderIndex: 0 }] })
    expect(dto).not.toHaveProperty('tripId')
    expect(dto).not.toHaveProperty('sortOrder')
    expect(() => JSON.stringify(dto)).not.toThrow()
})
