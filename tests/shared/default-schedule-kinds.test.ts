import { describe, expect, test } from 'bun:test'
import { DEFAULT_SCHEDULE_KINDS, getDefaultScheduleKinds } from '@/shared/constant/trip'

describe('getDefaultScheduleKinds', () => {
    test('지원 locale에 맞는 기본 일정 종류를 만든다', () => {
        expect(getDefaultScheduleKinds('ko')).toEqual(DEFAULT_SCHEDULE_KINDS)
        expect(getDefaultScheduleKinds('en').map((kind) => kind.label)).toEqual(['Planned', 'Confirmed time', 'Booking target'])
        expect(getDefaultScheduleKinds('ja').map((kind) => kind.label)).toEqual(['予定', '確定時刻', '予約目標'])
    })

    test('지원하지 않는 locale은 한국어로 되돌리고 매번 새 객체를 반환한다', () => {
        const first = getDefaultScheduleKinds('fr')
        const second = getDefaultScheduleKinds('fr')
        expect(first).toEqual(DEFAULT_SCHEDULE_KINDS)
        expect(first).not.toBe(second)
        expect(first[0]).not.toBe(second[0])
    })
})
