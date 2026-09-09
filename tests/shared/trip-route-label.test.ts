import { describe, expect, test } from 'bun:test'
import { resolveTripRouteLabel } from '@/shared/lib/trip-route-label'

describe('resolveTripRouteLabel', () => {
    test('출국 항공편을 우선해 라벨을 만든다', () => {
        expect(
            resolveTripRouteLabel([
                { direction: 'inbound', departCode: 'KIX', arriveCode: 'ICN' },
                { direction: 'outbound', departCode: 'ICN', arriveCode: 'KIX' },
            ]),
        ).toBe('ICN → KIX')
    })

    test('출국 항공편이 없으면 첫 항공편을 쓴다', () => {
        expect(resolveTripRouteLabel([{ direction: 'inbound', departCode: 'KIX', arriveCode: 'ICN' }])).toBe('KIX → ICN')
    })

    test('항공편이 없으면 null 이다', () => {
        expect(resolveTripRouteLabel([])).toBeNull()
    })
})
