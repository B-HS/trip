import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import type { PublicTrip } from '@/entities/trip/trip.type'
import type { TripUserState } from '@/entities/user-state/user-state.type'
import { TripPrintDocument } from '@/features/trip-print/trip-print-document'

afterEach(cleanup)

const TRIP = {
    id: 'trip-1',
    ownerId: 'owner-1',
    title: 'Taipei field notes',
    eyebrow: 'MODEL EXAMPLE',
    destination: 'Taipei',
    departureAirportCode: 'ICN',
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    customNights: null,
    customDays: null,
    periodNote: 'Cooler evenings expected.',
    disclaimer: 'Times are local.',
    verifiedOn: '2026-10-20',
    bufferPolicy: 'Keep ten minutes before confirmed times.',
    bookingNote: 'Book the airport transfer early.',
    footerNote: 'Keep this page with your passport.',
    sidebarNote: 'Use the EasyCard for city transit.',
    shareSlug: 'taipei-example',
    isPublic: true,
    likeCount: 0,
    revision: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-20T00:00:00.000Z',
    owner: { id: 'owner-1', name: 'Owner', username: 'owner', image: null },
    destinations: [{ id: 'destination-1', tripId: 'trip-1', sortOrder: 0, countryCode: 'TW', city: 'Taipei', createdAt: new Date() }],
    flights: [
        {
            id: 'flight-1',
            tripId: 'trip-1',
            sortOrder: 0,
            direction: 'outbound',
            label: 'Outbound',
            departCode: 'ICN',
            departTime: '09:00',
            departTerminal: '2',
            arriveCode: 'TPE',
            arriveTime: '10:45',
            arriveTerminal: '1',
            flightNumber: 'TW101',
            note: 'Arrive early.',
        },
    ],
    lodgings: [
        {
            id: 'lodging-1',
            tripId: 'trip-1',
            sortOrder: 0,
            name: 'Example Hotel',
            nameLocal: null,
            address: 'No. 1, Taipei',
            accessNote: 'Near MRT.',
            checkIn: '15:00',
            checkOut: '11:00',
            url: 'https://hotel.example.test',
            note: 'Ask for a quiet room.',
        },
    ],
    sidebarLinks: [
        { id: 'link-1', tripId: 'trip-1', sortOrder: 0, label: 'Transit guide', url: 'https://guide.example.test', description: 'Official guide' },
    ],
    scheduleKinds: [
        {
            id: 'kind-1',
            tripId: 'trip-1',
            key: 'confirmed',
            label: 'Confirmed',
            legendLabel: 'Fixed time',
            colorToken: 'success',
            bufferLabel: 'Ten-minute buffer',
            sortOrder: 0,
        },
    ],
    days: [
        {
            id: 'day-1',
            tripId: 'trip-1',
            dayIndex: 0,
            date: '2026-11-05',
            shortLabel: 'Day 1',
            title: 'Arrival',
            subtitle: 'Settle in',
            overview: 'Arrive and check in.',
            planHeadline: 'Plan',
            planNote: 'Take the train.',
            closingHeadline: 'Close',
            closingNote: 'Rest well.',
            morningSummary: null,
            afternoonSummary: 'Airport',
            eveningSummary: 'Dinner',
            facts: [{ id: 'fact-1', dayId: 'day-1', sortOrder: 0, label: 'Weather', value: 'Cool' }],
            routes: [
                {
                    id: 'route-1',
                    dayId: 'day-1',
                    sortOrder: 0,
                    origin: 'Airport',
                    destination: 'Hotel',
                    minutes: 40,
                    pathText: 'Airport MRT',
                    formula: '40 min',
                },
            ],
            scheduleItems: [
                {
                    id: 'item-1',
                    dayId: 'day-1',
                    sortOrder: 0,
                    timeLabel: '12:00',
                    title: 'Lunch',
                    kindId: 'kind-1',
                    note: 'Noodles',
                    bufferNote: 'Buffer',
                    mapQuery: 'Taipei Main Station',
                },
            ],
            notes: [
                {
                    id: 'note-1',
                    dayId: 'day-1',
                    sortOrder: 0,
                    leading: 'Bring',
                    linkLabel: 'tickets',
                    linkUrl: 'https://tickets.example.test',
                    trailing: '.',
                },
                {
                    id: 'note-2',
                    dayId: 'day-1',
                    sortOrder: 1,
                    leading: 'Official details',
                    linkLabel: null,
                    linkUrl: 'https://note-without-label.example.test',
                    trailing: null,
                },
            ],
        },
    ],
    bookings: [
        {
            id: 'booking-1',
            tripId: 'trip-1',
            sortOrder: 0,
            title: 'Airport transfer',
            whenLabel: 'Before departure',
            priority: 'p1',
            linkLabel: 'Reserve',
            linkUrl: 'https://booking.example.test',
            actionNote: 'Confirm luggage.',
            planStatus: 'pending',
            attachments: [
                {
                    id: 'attachment-1',
                    bookingId: 'booking-1',
                    sortOrder: 0,
                    kind: 'link',
                    url: 'https://attachment.example.test',
                    label: 'Voucher',
                    uploadId: null,
                    createdBy: 'owner-1',
                },
            ],
        },
    ],
    infoSections: [
        {
            id: 'info-1',
            tripId: 'trip-1',
            sortOrder: 0,
            title: 'Useful notes',
            isDefaultOpen: true,
            blocks: [
                {
                    id: 'block-1',
                    sectionId: 'info-1',
                    sortOrder: 0,
                    kind: 'heading',
                    emphasis: 'Before you go',
                    text: null,
                    linkLabel: null,
                    linkUrl: null,
                },
                {
                    id: 'block-2',
                    sectionId: 'info-1',
                    sortOrder: 1,
                    kind: 'bullet',
                    emphasis: null,
                    text: 'Bring cash.',
                    linkLabel: null,
                    linkUrl: null,
                },
                {
                    id: 'block-4',
                    sectionId: 'info-1',
                    sortOrder: 2,
                    kind: 'paragraph',
                    emphasis: null,
                    text: 'Official details',
                    linkLabel: null,
                    linkUrl: 'https://info-without-label.example.test',
                },
                { id: 'block-3', sectionId: 'info-1', sortOrder: 3, kind: 'day_table', emphasis: null, text: null, linkLabel: null, linkUrl: null },
            ],
        },
    ],
} as unknown as PublicTrip

const STATE: TripUserState = { scheduleCheckedIds: ['item-1'], bookingCheckedIds: ['booking-1'], memos: { 'day-1': 'Private reservation note' } }

describe('TripPrintDocument', () => {
    test('keeps document sections in deterministic order and includes complete detail URLs', async () => {
        const { container } = render(await TripPrintDocument({ trip: TRIP, locale: 'ko' }))
        expect([...container.querySelectorAll<HTMLElement>('[data-print-page]')].map((page) => page.dataset.printPage)).toEqual([
            'overview',
            'details',
            'day',
            'bookings',
            'info',
            'footer',
        ])
        expect(container.textContent).toContain('TW101')
        expect(container.textContent).toContain('Outbound')
        expect(container.textContent).toContain('09:00')
        expect(container.textContent).toContain('터미널 2')
        expect(container.textContent).toContain('10:45')
        expect(container.textContent).toContain('터미널 1')
        expect(container.textContent).toContain('Arrive early.')
        expect(container.textContent).toContain('No. 1, Taipei')
        expect(container.textContent).toContain('Example Hotel')
        expect(container.textContent).toContain('Near MRT.')
        expect(container.textContent).toContain('15:00')
        expect(container.textContent).toContain('11:00')
        expect(container.textContent).toContain('Ask for a quiet room.')
        expect(container.textContent).toContain('https://hotel.example.test')
        expect(container.textContent).toContain('https://guide.example.test')
        expect(container.textContent).toContain('Official guide')
        expect(container.textContent).toContain('https://booking.example.test')
        expect(container.textContent).toContain('https://www.google.com/maps/search/?api=1&query=Taipei%20Main%20Station')
        expect(container.textContent).toContain('Fixed time')
        expect(container.textContent).toContain('Ten-minute buffer')
        expect(container.textContent).toContain('Taipei')
        expect(container.querySelector('[data-print-destination="canonical"]')?.textContent).toBe('Taipei')
        expect(container.textContent).toContain('출국')
        expect(container.textContent).toContain('Day 1')
        expect(container.textContent).toContain('Settle in')
        expect(container.textContent).toContain('Arrive and check in.')
        expect(container.textContent).toContain('Take the train.')
        expect(container.textContent).toContain('Airport → Hotel')
        expect(container.textContent).toContain('Airport MRT')
        expect(container.textContent).toContain('Lunch')
        expect(container.textContent).toContain('Noodles')
        expect(container.textContent).toContain('Buffer')
        expect(container.textContent).toContain('Close')
        expect(container.textContent).toContain('Rest well.')
        expect(container.textContent).toContain('Bring')
        expect(container.textContent).toContain('tickets')
        expect(container.querySelector('a[href="https://note-without-label.example.test"]')?.textContent).toBe(
            'https://note-without-label.example.test',
        )
        expect(container.querySelector('a[href="https://info-without-label.example.test"]')?.textContent).toBe(
            'https://info-without-label.example.test',
        )
    })

    test('only authenticated documents include completion state and private memos', async () => {
        const publicRender = render(await TripPrintDocument({ trip: TRIP, locale: 'ko' }))
        expect(publicRender.container.textContent).not.toContain('Private reservation note')
        expect(publicRender.container.textContent).not.toContain('1 / 1 schedules done')
        publicRender.unmount()

        const memberRender = render(await TripPrintDocument({ trip: TRIP, locale: 'ko', viewerState: STATE }))
        expect(memberRender.container.textContent).toContain('Private reservation note')
        expect(memberRender.container.textContent).toContain('1 / 1 일정 완료')
        expect(memberRender.container.querySelector('[data-complete="true"]')).not.toBeNull()
    })

    test('omits empty appendices and interactive controls from the document tree', async () => {
        const minimalTrip = {
            ...TRIP,
            flights: [],
            lodgings: [],
            sidebarLinks: [],
            bookings: [],
            bookingNote: null,
            infoSections: [],
            footerNote: null,
        } as PublicTrip
        const { container } = render(await TripPrintDocument({ trip: minimalTrip, locale: 'ko' }))
        expect([...container.querySelectorAll<HTMLElement>('[data-print-page]')].map((page) => page.dataset.printPage)).toEqual(['overview', 'day'])
        expect(container.querySelector('button, input, textarea, select')).toBeNull()
        expect(container.querySelector('[data-print-page="day"]')?.getAttribute('data-print-density')).toBe('regular')
    })

    test('keeps a booking-note-only appendix without inventing booking progress', async () => {
        const noteOnlyTrip = {
            ...TRIP,
            bookings: [],
            infoSections: [],
            footerNote: null,
        } as PublicTrip
        const { container } = render(await TripPrintDocument({ trip: noteOnlyTrip, locale: 'ko' }))

        expect(container.querySelector('[data-print-page="bookings"]')?.textContent).toContain(TRIP.bookingNote ?? '')
        expect(container.querySelector('[data-print-page="bookings"]')?.textContent).not.toContain('0 / 0')
        expect(container.querySelector('[data-print-page="bookings"] [data-complete]')).toBeNull()
    })
})
