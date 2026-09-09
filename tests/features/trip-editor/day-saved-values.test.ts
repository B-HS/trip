import { describe, expect, test } from 'bun:test'
import type { SavedDay } from '@/entities/trip/trip.type'
import type { DayValues } from '@/entities/trip/trip.validate'
import { toSavedDayValues } from '@/features/trip-editor/day-saved-values'

const KIND_ID = '8c7d6e5f-4a3b-4c2d-9e8f-1a2b3c4d5e6f'

const values = {
    date: '2026-10-01',
    shortLabel: '10.01',
    title: '첫째 날',
    subtitle: null,
    overview: null,
    planHeadline: null,
    planNote: null,
    closingHeadline: null,
    closingNote: null,
    morningSummary: null,
    afternoonSummary: null,
    eveningSummary: null,
    facts: [{ label: '숙소', value: '난바' }],
    routes: [{ origin: 'KIX', destination: '난바', minutes: 45, pathText: null, formula: null }],
    scheduleItems: [
        { timeLabel: '09:00', title: '출발', kindId: KIND_ID, note: null, bufferNote: null, mapQuery: null },
        { timeLabel: '12:00', title: '점심', kindId: KIND_ID, note: null, bufferNote: null, mapQuery: null },
    ],
    notes: [{ leading: null, linkLabel: null, linkUrl: null, trailing: null }],
} satisfies DayValues

const saved = {
    id: 'day-1',
    facts: [{ id: 'fact-1' }],
    routes: [{ id: 'route-1' }],
    scheduleItems: [{ id: 'schedule-1' }, { id: 'schedule-2' }],
    notes: [{ id: 'note-1' }],
} satisfies SavedDay

describe('toSavedDayValues', () => {
    test('저장된 날짜 id 를 채운다', () => {
        expect(toSavedDayValues(values, saved).id).toBe('day-1')
    })

    test('하위 행에 입력 순서대로 서버 id 를 합친다', () => {
        const merged = toSavedDayValues(values, saved)
        expect(merged.facts.map((fact) => fact.id)).toEqual(['fact-1'])
        expect(merged.routes.map((route) => route.id)).toEqual(['route-1'])
        expect(merged.scheduleItems.map((item) => item.id)).toEqual(['schedule-1', 'schedule-2'])
        expect(merged.notes.map((note) => note.id)).toEqual(['note-1'])
    })

    test('입력 값은 그대로 유지한다', () => {
        const merged = toSavedDayValues(values, saved)
        expect(merged.title).toBe('첫째 날')
        expect(merged.scheduleItems[1]?.title).toBe('점심')
    })
})
