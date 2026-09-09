import { describe, expect, test } from 'bun:test'
import type { TripSummary } from '@/entities/trip/trip.type'
import { COUNTRIES } from '@/shared/constant/countries'
import { HOME_AIRPORT_CODE } from '@/shared/constant/trip'
import { resolveGlobeRoutes } from '@/shared/ui/three/globe-math'
import { buildDestinationRoutes, collectGlobeRoutes, resolveTripRouteLabel, toDestinationPoint } from '@/widgets/trips/trip-summary.derive'

const baseTrip: TripSummary = {
    id: 'trip-1',
    title: '오사카 여행 노트',
    eyebrow: null,
    destination: '오사카',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    periodNote: null,
    role: 'owner',
    dayCount: 7,
    scheduleCount: 65,
    bookingCount: 9,
    updatedAt: '2026-09-09T00:00:00.000Z',
    isFavorite: false,
    destinations: [],
    flights: [],
}

const withDestinations = (destinations: TripSummary['destinations'], id = 'trip-1'): TripSummary => ({ ...baseTrip, id, destinations })

describe('toDestinationPoint', () => {
    test('나라 중심 좌표와 코드·도시 라벨을 만든다', () => {
        expect(toDestinationPoint({ countryCode: 'JP', city: '오사카' })).toEqual({
            lat: COUNTRIES.JP.lat,
            lng: COUNTRIES.JP.lng,
            label: 'JP 오사카',
        })
    })

    test('도시가 없으면 나라 이름을 라벨로 쓴다', () => {
        expect(toDestinationPoint({ countryCode: 'JP', city: null })?.label).toBe('JP 일본')
    })

    test('모르는 나라 코드는 null 이다', () => {
        expect(toDestinationPoint({ countryCode: 'ZZ', city: null })).toBeNull()
    })
})

describe('buildDestinationRoutes', () => {
    test('출발 공항에서 목적지 순서대로 이어지는 경로를 만든다', () => {
        const routes = buildDestinationRoutes([
            { countryCode: 'JP', city: '오사카' },
            { countryCode: 'TW', city: '타이베이' },
        ])
        expect(routes).toHaveLength(2)
        expect(routes[0].from).toBe(HOME_AIRPORT_CODE)
        expect(routes[0].to).toEqual({ lat: COUNTRIES.JP.lat, lng: COUNTRIES.JP.lng, label: 'JP 오사카' })
        expect(routes[1].from).toEqual({ lat: COUNTRIES.JP.lat, lng: COUNTRIES.JP.lng, label: 'JP 오사카' })
        expect(routes[1].to).toEqual({ lat: COUNTRIES.TW.lat, lng: COUNTRIES.TW.lng, label: 'TW 타이베이' })
    })

    test('목적지가 하나면 출발 공항에서 한 구간만 만든다', () => {
        expect(buildDestinationRoutes([{ countryCode: 'JP', city: null }])).toHaveLength(1)
    })

    test('목적지가 없거나 모두 모르는 코드면 경로가 없다', () => {
        expect(buildDestinationRoutes([])).toEqual([])
        expect(buildDestinationRoutes([{ countryCode: 'ZZ', city: null }])).toEqual([])
    })
})

describe('collectGlobeRoutes', () => {
    test('항공편이 있으면 항공편 경로를 쓴다', () => {
        const trip: TripSummary = {
            ...baseTrip,
            destinations: [{ countryCode: 'JP', city: '오사카' }],
            flights: [{ direction: 'outbound', departCode: 'ICN', arriveCode: 'KIX' }],
        }
        expect(collectGlobeRoutes([trip])).toEqual([{ from: 'ICN', to: 'KIX' }])
    })

    test('항공편이 없으면 목적지 체인을 쓴다', () => {
        const routes = collectGlobeRoutes([withDestinations([{ countryCode: 'JP', city: '오사카' }])])
        expect(routes).toHaveLength(1)
        expect(routes[0].from).toBe(HOME_AIRPORT_CODE)
    })

    test('여러 트립의 같은 구간은 한 번만 남는다', () => {
        const routes = collectGlobeRoutes([
            withDestinations([{ countryCode: 'JP', city: '오사카' }]),
            withDestinations([{ countryCode: 'JP', city: '오사카' }], 'trip-2'),
        ])
        expect(routes).toHaveLength(1)
    })

    test('만들어진 경로는 지구본 좌표로 해석된다', () => {
        const resolved = resolveGlobeRoutes(collectGlobeRoutes([withDestinations([{ countryCode: 'JP', city: '오사카' }])]))
        expect(resolved).toHaveLength(1)
        expect(resolved[0].from.code).toBe(HOME_AIRPORT_CODE)
        expect(resolved[0].to.label).toBe('JP 오사카')
        expect(resolved[0].to.lat).toBeCloseTo(COUNTRIES.JP.lat)
    })

    test('항공편도 목적지도 없으면 경로가 없다', () => {
        expect(collectGlobeRoutes([baseTrip])).toEqual([])
    })
})

describe('resolveTripRouteLabel', () => {
    test('출국 항공편을 우선해 라벨을 만든다', () => {
        expect(
            resolveTripRouteLabel([
                { direction: 'inbound', departCode: 'KIX', arriveCode: 'ICN' },
                { direction: 'outbound', departCode: 'ICN', arriveCode: 'KIX' },
            ]),
        ).toBe('ICN → KIX')
    })

    test('항공편이 없으면 null 이다', () => {
        expect(resolveTripRouteLabel([])).toBeNull()
    })
})
