import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import type { PublicTrip, TripDayDetail, TripScheduleItem } from '@/entities/trip/trip.type'

type MotionStubProps = PropsWithChildren<{ className?: string }>

const MotionElement = ({ className, children }: MotionStubProps) => <div className={className}>{children}</div>

mock.module('motion/react', () => ({
    motion: { li: MotionElement, div: MotionElement, ol: MotionElement },
    AnimatePresence: ({ children }: PropsWithChildren) => children,
}))

const { TripPrintLayout } = await import('@/features/trip-viewer/trip-print-layout')

afterEach(cleanup)

const makeDay = (dayIndex: number, itemCount: number): TripDayDetail => ({
    id: `day-${dayIndex}`,
    tripId: 'trip-1',
    dayIndex,
    date: `2026-10-${String(dayIndex + 1).padStart(2, '0')}`,
    shortLabel: `Day ${dayIndex + 1}`,
    title: `Day ${dayIndex + 1}`,
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
    scheduleItems: Array.from(
        { length: itemCount },
        (_, index) =>
            ({
                id: `item-${dayIndex}-${index}`,
                dayId: `day-${dayIndex}`,
                sortOrder: index,
                timeLabel: `${String(8 + index).padStart(2, '0')}:00`,
                title: `Stop ${index + 1}`,
                kindId: 'missing-kind',
                note: null,
                bufferNote: null,
                mapQuery: null,
            }) satisfies TripScheduleItem,
    ),
    notes: [],
})

const TRIP = {
    title: 'Print fixture',
    scheduleKinds: [],
    days: [makeDay(0, 1), makeDay(1, 10), makeDay(2, 17)],
    bookings: [],
    bookingNote: null,
    infoSections: [],
    footerNote: null,
} satisfies Pick<PublicTrip, 'title' | 'scheduleKinds' | 'days' | 'bookings' | 'bookingNote' | 'infoSections' | 'footerNote'>

describe('TripPrintLayout', () => {
    test('creates one deterministic print page wrapper per day after the summary', () => {
        const { container } = render(<TripPrintLayout trip={TRIP} sidebar={<aside>Summary</aside>} checkedScheduleIds={[]} checkedBookingIds={[]} />)

        expect([...container.querySelectorAll<HTMLElement>('[data-print-page]')].map((page) => page.dataset.printPage)).toEqual([
            'summary',
            'day',
            'day',
            'day',
        ])
        expect([...container.querySelectorAll<HTMLElement>('[data-print-day]')].map((page) => page.dataset.printDay)).toEqual(['1', '2', '3'])
        expect([...container.querySelectorAll<HTMLElement>('[data-print-day]')].map((page) => page.dataset.printDensity)).toEqual([
            'regular',
            'compact',
            'tight',
        ])
    })

    test('keeps optional supplement pages out when they have no content', () => {
        const { container } = render(<TripPrintLayout trip={TRIP} sidebar={<aside>Summary</aside>} checkedScheduleIds={[]} checkedBookingIds={[]} />)

        expect(container.querySelector('[data-print-page="bookings"]')).toBeNull()
        expect(container.querySelector('[data-print-page="info"]')).toBeNull()
        expect(container.querySelector('[data-print-page="footer"]')).toBeNull()
    })
})
