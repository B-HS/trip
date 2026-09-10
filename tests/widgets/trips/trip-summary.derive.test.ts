import { describe, expect, test } from 'bun:test'
import type { TripSummary } from '@/entities/trip/trip.type'
import { COUNTRIES } from '@/shared/constant/countries'
import { HOME_AIRPORT_CODE } from '@/shared/constant/trip'
import { formatTripDateRange } from '@/shared/lib/trip-date-range'
import { resolveGlobeRoutes } from '@/shared/ui/three/globe-math'
import {
    buildDestinationRoutes,
    collectGlobeRoutes,
    filterTripsByRoute,
    findGlobeRoute,
    toDestinationPoint,
} from '@/widgets/trips/trip-summary.derive'

const baseTrip: TripSummary = {
    id: 'trip-1',
    title: '오사카 여행 노트',
    eyebrow: null,
    destination: '오사카',
    departureAirportCode: null,
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    customNights: null,
    customDays: null,
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

const OSAKA_DESTINATION: TripSummary['destinations'] = [{ countryCode: 'JP', city: '오사카' }]

const withDestinations = (destinations: TripSummary['destinations'], id = 'trip-1'): TripSummary => ({ ...baseTrip, id, destinations })

const tripSummaryText = (trip: TripSummary) => `${trip.title} · ${formatTripDateRange(trip)}`

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
        const routes = buildDestinationRoutes(
            [
                { countryCode: 'JP', city: '오사카' },
                { countryCode: 'TW', city: '타이베이' },
            ],
            'PUS',
        )
        expect(routes).toHaveLength(2)
        expect(routes[0].from).toBe('PUS')
        expect(routes[0].to).toEqual({ lat: COUNTRIES.JP.lat, lng: COUNTRIES.JP.lng, label: 'JP 오사카' })
        expect(routes[1].from).toEqual({ lat: COUNTRIES.JP.lat, lng: COUNTRIES.JP.lng, label: 'JP 오사카' })
        expect(routes[1].to).toEqual({ lat: COUNTRIES.TW.lat, lng: COUNTRIES.TW.lng, label: 'TW 타이베이' })
    })

    test('출발 공항이 없으면 기본 출발 공항에서 시작한다', () => {
        expect(buildDestinationRoutes(OSAKA_DESTINATION, null)[0].from).toBe(HOME_AIRPORT_CODE)
    })

    test('모르는 출발 공항 코드도 기본 출발 공항으로 되돌린다', () => {
        expect(buildDestinationRoutes(OSAKA_DESTINATION, 'ZZZ')[0].from).toBe(HOME_AIRPORT_CODE)
    })

    test('경로마다 코드 키와 코드·도시 라벨을 만든다', () => {
        const [route] = buildDestinationRoutes(OSAKA_DESTINATION, 'ICN')
        expect(route.key).toBe('ICN-JP')
        expect(route.codeLabel).toBe('ICN → JP')
        expect(route.label).toBe('ICN → JP · 서울 → 오사카')
    })

    test('목적지가 하나면 출발 공항에서 한 구간만 만든다', () => {
        expect(buildDestinationRoutes([{ countryCode: 'JP', city: null }], null)).toHaveLength(1)
    })

    test('목적지가 없거나 모두 모르는 코드면 경로가 없다', () => {
        expect(buildDestinationRoutes([], null)).toEqual([])
        expect(buildDestinationRoutes([{ countryCode: 'ZZ', city: null }], null)).toEqual([])
    })
})

describe('collectGlobeRoutes', () => {
    test('항공편이 있으면 항공편 경로를 쓴다', () => {
        const trip: TripSummary = {
            ...baseTrip,
            destinations: OSAKA_DESTINATION,
            flights: [{ direction: 'outbound', departCode: 'ICN', arriveCode: 'KIX' }],
        }
        const [route] = collectGlobeRoutes([trip])
        expect(route.key).toBe('ICN-KIX')
        expect(route.codeLabel).toBe('ICN → KIX')
        expect(route.label).toBe('ICN → KIX · 서울 → 오사카')
        expect(route.from).toBe('ICN')
        expect(route.to).toBe('KIX')
    })

    test('항공편이 없으면 트립의 출발 공항에서 목적지 체인을 쓴다', () => {
        const routes = collectGlobeRoutes([{ ...withDestinations(OSAKA_DESTINATION), departureAirportCode: 'PUS' }])
        expect(routes).toHaveLength(1)
        expect(routes[0].key).toBe('PUS-JP')
        expect(routes[0].from).toBe('PUS')
    })

    test('경로마다 해당 트립 id 를 모은다', () => {
        const routes = collectGlobeRoutes([withDestinations(OSAKA_DESTINATION), withDestinations(OSAKA_DESTINATION, 'trip-2')])
        expect(routes).toHaveLength(1)
        expect(routes[0].tripIds).toEqual(['trip-1', 'trip-2'])
    })

    test('설명은 트립 제목과 기간을 이어 붙인다', () => {
        const [route] = collectGlobeRoutes([withDestinations(OSAKA_DESTINATION)])
        expect(route.description).toBe(tripSummaryText(baseTrip))
    })

    test('트립이 셋을 넘으면 셋만 적고 나머지는 개수로 줄인다', () => {
        const trips = ['trip-1', 'trip-2', 'trip-3', 'trip-4', 'trip-5'].map((id) => ({
            ...withDestinations(OSAKA_DESTINATION, id),
            title: `${id} 여행`,
        }))
        const [route] = collectGlobeRoutes(trips)
        expect(route.description).toBe(`${tripSummaryText(trips[0])}, ${tripSummaryText(trips[1])}, ${tripSummaryText(trips[2])}, 외 2개`)
        expect(route.tripIds).toHaveLength(5)
    })

    test('만들어진 경로는 지구본 좌표로 해석되고 키를 그대로 쓴다', () => {
        const resolved = resolveGlobeRoutes(collectGlobeRoutes([withDestinations(OSAKA_DESTINATION)]))
        expect(resolved).toHaveLength(1)
        expect(resolved[0].key).toBe('ICN-JP')
        expect(resolved[0].label).toBe('ICN → JP · 서울 → 오사카')
        expect(resolved[0].from.code).toBe(HOME_AIRPORT_CODE)
        expect(resolved[0].to.label).toBe('JP 오사카')
        expect(resolved[0].to.lat).toBeCloseTo(COUNTRIES.JP.lat)
    })

    test('항공편도 목적지도 없으면 경로가 없다', () => {
        expect(collectGlobeRoutes([baseTrip])).toEqual([])
    })
})

describe('findGlobeRoute · filterTripsByRoute', () => {
    const trips = [withDestinations(OSAKA_DESTINATION), withDestinations([{ countryCode: 'TW', city: '타이베이' }], 'trip-2')]
    const routes = collectGlobeRoutes(trips)

    test('선택한 키가 없으면 경로도 없고 전체 트립이 남는다', () => {
        expect(findGlobeRoute(routes, null)).toBeNull()
        expect(filterTripsByRoute(trips, null)).toEqual(trips)
    })

    test('모르는 키는 경로를 찾지 못한다', () => {
        expect(findGlobeRoute(routes, 'ICN-ZZ')).toBeNull()
    })

    test('선택한 경로를 가진 트립만 남긴다', () => {
        const route = findGlobeRoute(routes, 'ICN-JP')
        expect(route?.tripIds).toEqual(['trip-1'])
        expect(filterTripsByRoute(trips, route).map((trip) => trip.id)).toEqual(['trip-1'])
    })
})
