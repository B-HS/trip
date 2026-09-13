import { describe, expect, test } from 'bun:test'
import type { TripDayDetail } from '@/entities/trip/trip.type'
import { getPrintDensity } from '@/shared/lib/print-density'

const makeDay = (overrides: Partial<TripDayDetail> = {}): TripDayDetail => ({
    id: 'day-1',
    tripId: 'trip-1',
    dayIndex: 0,
    date: '2026-10-01',
    shortLabel: 'Day 1',
    title: 'Day 1',
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
    scheduleItems: [],
    notes: [],
    ...overrides,
})

describe('getPrintDensity', () => {
    test('keeps ordinary days at regular density', () => {
        expect(getPrintDensity(makeDay({ scheduleItems: [{} as TripDayDetail['scheduleItems'][number]] }))).toBe('regular')
    })

    test('uses compact density before a day becomes tight', () => {
        expect(
            getPrintDensity(
                makeDay({
                    scheduleItems: Array.from({ length: 7 }, () => ({}) as TripDayDetail['scheduleItems'][number]),
                    facts: Array.from({ length: 3 }, () => ({}) as TripDayDetail['facts'][number]),
                }),
            ),
        ).toBe('compact')
    })

    test('uses tight density for the fullest days without dropping content', () => {
        const day = makeDay({
            scheduleItems: Array.from({ length: 12 }, () => ({}) as TripDayDetail['scheduleItems'][number]),
            facts: Array.from({ length: 3 }, () => ({}) as TripDayDetail['facts'][number]),
            routes: [{} as TripDayDetail['routes'][number]],
            notes: [{} as TripDayDetail['notes'][number]],
        })
        expect(getPrintDensity(day)).toBe('tight')
        expect(day.scheduleItems).toHaveLength(12)
    })
})
