import { describe, expect, test } from 'bun:test'
import { orderDaysByIds } from '@/entities/trip/trip.order'

const days = [
    { id: 'day-a', dayIndex: 0 },
    { id: 'day-b', dayIndex: 1 },
    { id: 'day-c', dayIndex: 2 },
]

describe('orderDaysByIds', () => {
    test('전달한 id 순서대로 재배열한다', () => {
        expect(orderDaysByIds(days, ['day-c', 'day-a', 'day-b']).map((day) => day.id)).toEqual(['day-c', 'day-a', 'day-b'])
    })

    test('dayIndex 를 0 부터 다시 매긴다', () => {
        expect(orderDaysByIds(days, ['day-c', 'day-a', 'day-b']).map((day) => day.dayIndex)).toEqual([0, 1, 2])
    })

    test('원본 배열을 바꾸지 않는다', () => {
        orderDaysByIds(days, ['day-c', 'day-a', 'day-b'])
        expect(days.map((day) => day.id)).toEqual(['day-a', 'day-b', 'day-c'])
    })

    test('id 목록에 없는 날짜는 뒤에 붙이고, 모르는 id 는 무시한다', () => {
        expect(orderDaysByIds(days, ['day-c', 'day-missing']).map((day) => day.id)).toEqual(['day-c', 'day-a', 'day-b'])
    })

    test('다른 필드는 그대로 유지한다', () => {
        const detailed = [{ id: 'day-a', dayIndex: 0, title: '첫째 날' }]
        expect(orderDaysByIds(detailed, ['day-a'])[0]?.title).toBe('첫째 날')
    })
})
