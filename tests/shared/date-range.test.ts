import { describe, expect, test } from 'bun:test'
import { monthRange, weekRange } from '@/shared/lib/date-range'

describe('weekRange', () => {
    test('주 중간 날짜는 그 주 월요일부터 일요일까지다', () => {
        expect(weekRange('2026-09-10')).toEqual({ start: '2026-09-07', end: '2026-09-13' })
    })

    test('월요일은 그날이 시작이다', () => {
        expect(weekRange('2026-09-07')).toEqual({ start: '2026-09-07', end: '2026-09-13' })
    })

    test('일요일은 지난 월요일이 시작이다', () => {
        expect(weekRange('2026-09-13')).toEqual({ start: '2026-09-07', end: '2026-09-13' })
    })

    test('월요일 이전 날짜는 이전 달로 넘어간다', () => {
        expect(weekRange('2026-10-01')).toEqual({ start: '2026-09-28', end: '2026-10-04' })
    })
})

describe('monthRange', () => {
    test('그 달의 1일부터 말일까지다', () => {
        expect(monthRange('2026-09-10')).toEqual({ start: '2026-09-01', end: '2026-09-30' })
    })

    test('31일까지 있는 달을 정확히 계산한다', () => {
        expect(monthRange('2026-01-15')).toEqual({ start: '2026-01-01', end: '2026-01-31' })
    })

    test('윤년 2월 말일을 정확히 계산한다', () => {
        expect(monthRange('2028-02-05')).toEqual({ start: '2028-02-01', end: '2028-02-29' })
    })
})
