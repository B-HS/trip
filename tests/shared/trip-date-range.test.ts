import { describe, expect, test } from 'bun:test'
import { formatTripDateRange } from '@/shared/lib/trip-date-range'

describe('formatTripDateRange', () => {
    test('시작일은 연도까지, 종료일은 월일까지 쓰고 요일을 덧붙인다', () => {
        expect(formatTripDateRange({ startDate: '2026-10-01', endDate: '2026-10-07' })).toBe('2026.10.01 – 10.07 (목–수)')
    })

    test('같은 날이면 시작과 종료 요일이 같다', () => {
        expect(formatTripDateRange({ startDate: '2026-10-01', endDate: '2026-10-01' })).toBe('2026.10.01 – 10.01 (목–목)')
    })

    test('해를 넘겨도 종료일은 월일만 쓴다', () => {
        expect(formatTripDateRange({ startDate: '2026-12-30', endDate: '2027-01-02' })).toBe('2026.12.30 – 01.02 (수–토)')
    })
})
