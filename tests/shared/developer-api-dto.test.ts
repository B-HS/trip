import { expect, test } from 'bun:test'
import { toDeveloperTripDetail } from '@/shared/lib/developer-api-dto'
import { tripTemplateSchema } from '@/shared/lib/trip-template'

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
        scheduleKinds: [
            {
                id: 'kind-1',
                tripId: 'trip-1',
                key: 'sightseeing',
                label: 'Sightseeing',
                legendLabel: 'Sightseeing',
                colorToken: 'muted',
                bufferLabel: null,
            },
        ],
        days: [
            {
                id: 'day-1',
                tripId: 'trip-1',
                dayIndex: 0,
                date: '2026-04-01',
                shortLabel: 'Day 1',
                title: 'Arrival',
                subtitle: null,
                overview: null,
                planHeadline: null,
                planNote: null,
                closingHeadline: null,
                closingNote: null,
                morningSummary: null,
                afternoonSummary: null,
                eveningSummary: null,
                facts: [],
                routes: [],
                scheduleItems: [
                    {
                        id: 'item-1',
                        dayId: 'day-1',
                        timeLabel: '09:00',
                        title: 'Walk',
                        kindId: 'kind-1',
                        note: null,
                        bufferNote: null,
                        mapQuery: null,
                    },
                ],
                notes: [],
            },
        ],
        bookings: [
            {
                id: 'booking-1',
                tripId: 'trip-1',
                sortOrder: 0,
                title: 'Rail pass',
                whenLabel: null,
                priority: 'p2',
                linkLabel: null,
                linkUrl: null,
                actionNote: null,
                planStatus: null,
                attachments: [
                    {
                        id: 'attachment-1',
                        bookingId: 'booking-1',
                        sortOrder: 0,
                        kind: 'link',
                        url: 'https://example.com/pass',
                        label: 'Pass',
                        uploadId: 'upload-1',
                        createdBy: 'user-1',
                    },
                ],
            },
        ],
        infoSections: [
            {
                id: 'info-1',
                tripId: 'trip-1',
                sortOrder: 0,
                title: 'Tips',
                isDefaultOpen: false,
                blocks: [
                    {
                        id: 'block-1',
                        sectionId: 'info-1',
                        sortOrder: 0,
                        kind: 'paragraph',
                        emphasis: null,
                        text: 'Bring a pass.',
                        linkLabel: null,
                        linkUrl: null,
                    },
                ],
            },
        ],
    } as never)

    expect(dto).toMatchObject({ id: 'trip-1', revision: 3, destinations: [{ countryCode: 'JP', city: 'Kyoto' }] })
    expect(dto.days[0]?.scheduleItems[0]?.kind).toBe('sightseeing')
    expect(dto.bookings[0]?.attachments[0]).toEqual({ kind: 'link', url: 'https://example.com/pass', label: 'Pass' })
    expect(dto.infoSections[0]?.blocks[0]).toEqual({
        kind: 'paragraph',
        emphasis: null,
        text: 'Bring a pass.',
        linkLabel: null,
        linkUrl: null,
    })
    expect(() => tripTemplateSchema.parse(dto)).not.toThrow()
    expect(dto).not.toHaveProperty('tripId')
    expect(dto).not.toHaveProperty('sortOrder')
    expect(dto.days[0]?.scheduleItems[0]).not.toHaveProperty('kindId')
    expect(dto.bookings[0]?.attachments[0]).not.toHaveProperty('uploadId')
    expect(() => JSON.stringify(dto)).not.toThrow()
})
