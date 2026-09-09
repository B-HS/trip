import { describe, expect, test } from 'bun:test'
import { formatTripLength, resolveTripLength } from '@/shared/lib/trip-length'

const period = { startDate: '2026-10-01', endDate: '2026-10-07' }

describe('resolveTripLength', () => {
    test('박과 일이 모두 있으면 커스텀 값을 그대로 쓴다', () => {
        expect(resolveTripLength({ ...period, nights: 7, days: 5 })).toEqual({ nights: 7, days: 5 })
    })

    test('커스텀 값이 없으면 날짜 차이로 계산한다', () => {
        expect(resolveTripLength({ ...period, nights: null, days: null })).toEqual({ nights: 6, days: 7 })
    })

    test('한쪽만 있으면 날짜 차이로 계산한다', () => {
        expect(resolveTripLength({ ...period, nights: 3, days: null })).toEqual({ nights: 6, days: 7 })
        expect(resolveTripLength({ ...period, nights: null, days: 3 })).toEqual({ nights: 6, days: 7 })
    })

    test('0박은 유효한 커스텀 값이라 자동 계산으로 넘어가지 않는다', () => {
        expect(resolveTripLength({ startDate: '2026-10-01', endDate: '2026-10-02', nights: 0, days: 2 })).toEqual({ nights: 0, days: 2 })
    })

    test('같은 날짜면 0박 1일이다', () => {
        expect(resolveTripLength({ startDate: '2026-10-01', endDate: '2026-10-01', nights: null, days: null })).toEqual({ nights: 0, days: 1 })
    })
})

describe('formatTripLength', () => {
    test('커스텀 값을 박·일 라벨로 만든다', () => {
        expect(formatTripLength({ startDate: '2026-10-01', endDate: '2026-10-02', nights: 0, days: 2 })).toBe('0박 2일')
    })

    test('커스텀 값이 없으면 날짜로 계산한 라벨을 만든다', () => {
        expect(formatTripLength({ ...period, nights: null, days: null })).toBe('6박 7일')
    })
})
