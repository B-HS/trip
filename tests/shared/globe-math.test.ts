import { describe, expect, test } from 'bun:test'
import { Vector3 } from 'three'
import {
    buildGlobeArc,
    collectGlobeAirports,
    describeGlobeRoutes,
    formatGlobeRouteLabel,
    greatCircleArc,
    latLngToVector3,
    longitudeFacingRotation,
    resolveGlobeRoutes,
} from '@/shared/ui/three/globe-math'

const RADIUS = 2
const PRECISION = 6

describe('latLngToVector3', () => {
    test('위도 0 · 경도 0 은 +x 축에 놓인다', () => {
        const point = latLngToVector3(0, 0, RADIUS)
        expect(point.x).toBeCloseTo(RADIUS, PRECISION)
        expect(point.y).toBeCloseTo(0, PRECISION)
        expect(point.z).toBeCloseTo(0, PRECISION)
    })

    test('북극과 남극은 y 축 끝에 놓인다', () => {
        const north = latLngToVector3(90, 0, RADIUS)
        const south = latLngToVector3(-90, 137, RADIUS)
        expect(north.x).toBeCloseTo(0, PRECISION)
        expect(north.y).toBeCloseTo(RADIUS, PRECISION)
        expect(north.z).toBeCloseTo(0, PRECISION)
        expect(south.y).toBeCloseTo(-RADIUS, PRECISION)
    })

    test('경도 90 은 -z 축, 경도 180 은 -x 축에 놓인다', () => {
        const east = latLngToVector3(0, 90, RADIUS)
        const opposite = latLngToVector3(0, 180, RADIUS)
        expect(east.x).toBeCloseTo(0, PRECISION)
        expect(east.z).toBeCloseTo(-RADIUS, PRECISION)
        expect(opposite.x).toBeCloseTo(-RADIUS, PRECISION)
        expect(opposite.z).toBeCloseTo(0, PRECISION)
    })

    test('모든 좌표는 주어진 반지름 위에 놓인다', () => {
        expect(latLngToVector3(37.4602, 126.4407, RADIUS).length()).toBeCloseTo(RADIUS, PRECISION)
        expect(latLngToVector3(-33.9399, 151.1753, RADIUS).length()).toBeCloseTo(RADIUS, PRECISION)
    })
})

describe('longitudeFacingRotation', () => {
    test('회전을 적용하면 해당 경도가 +z 를 향한다', () => {
        const longitude = 126.4407
        const point = latLngToVector3(0, longitude, 1).applyAxisAngle(new Vector3(0, 1, 0), longitudeFacingRotation(longitude))
        expect(point.z).toBeCloseTo(1, PRECISION)
        expect(point.x).toBeCloseTo(0, PRECISION)
    })
})

describe('greatCircleArc', () => {
    const from = latLngToVector3(37.4602, 126.4407, 1)
    const to = latLngToVector3(34.4347, 135.2441, 1)

    test('양 끝점은 입력 좌표와 일치한다', () => {
        const points = greatCircleArc(from, to, 1, 24, 0.2)
        expect(points).toHaveLength(25)
        expect(points[0].distanceTo(from)).toBeCloseTo(0, PRECISION)
        expect(points[points.length - 1].distanceTo(to)).toBeCloseTo(0, PRECISION)
    })

    test('중간 지점은 lift 만큼 들어 올려진다', () => {
        const lift = 0.3
        const points = greatCircleArc(from, to, 1, 20, lift)
        expect(points[10].length()).toBeCloseTo(1 + lift, PRECISION)
        expect(points[0].length()).toBeCloseTo(1, PRECISION)
    })

    test('segments 가 최소값보다 작아도 두 구간 이상을 만든다', () => {
        expect(greatCircleArc(from, to, 1, 0, 0)).toHaveLength(3)
    })

    test('같은 지점끼리도 구간을 만들며 반지름 위에 남는다', () => {
        const points = greatCircleArc(from, from, 1, 8, 0)
        expect(points).toHaveLength(9)
        points.forEach((point) => expect(point.length()).toBeCloseTo(1, PRECISION))
    })
})

describe('resolveGlobeRoutes', () => {
    test('모르는 IATA 코드는 건너뛴다', () => {
        const routes = resolveGlobeRoutes([
            { from: 'ICN', to: 'KIX' },
            { from: 'ICN', to: 'ZZZ' },
            { from: 'QQQ', to: 'KIX' },
        ])
        expect(routes).toHaveLength(1)
        expect(routes[0].key).toBe('ICN-KIX')
    })

    test('소문자와 공백은 정규화한다', () => {
        const routes = resolveGlobeRoutes([{ from: ' icn ', to: 'kix' }])
        expect(routes).toHaveLength(1)
        expect(routes[0].from.code).toBe('ICN')
        expect(routes[0].to.code).toBe('KIX')
    })

    test('출발지와 도착지가 같거나 중복된 경로는 제외한다', () => {
        const routes = resolveGlobeRoutes([
            { from: 'ICN', to: 'ICN' },
            { from: 'ICN', to: 'KIX' },
            { from: 'ICN', to: 'KIX' },
            { from: 'KIX', to: 'ICN' },
        ])
        expect(routes.map((route) => route.key)).toEqual(['ICN-KIX', 'KIX-ICN'])
    })

    test('좌표는 AIRPORTS 값을 그대로 사용한다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }])
        expect(route.from.lat).toBeCloseTo(37.4602, PRECISION)
        expect(route.to.lng).toBeCloseTo(135.2441, PRECISION)
    })
})

describe('collectGlobeAirports', () => {
    test('중복 없이 공항 목록을 모은다', () => {
        const routes = resolveGlobeRoutes([
            { from: 'ICN', to: 'KIX' },
            { from: 'KIX', to: 'ICN' },
            { from: 'ICN', to: 'FUK' },
        ])
        expect(collectGlobeAirports(routes).map((airport) => airport.code)).toEqual(['ICN', 'KIX', 'FUK'])
    })
})

describe('buildGlobeArc', () => {
    test('경로 좌표에서 곧바로 아크를 만든다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }])
        const points = buildGlobeArc(route, 1, 16, 0.1)
        expect(points).toHaveLength(17)
        expect(points[0].distanceTo(latLngToVector3(route.from.lat, route.from.lng, 1))).toBeCloseTo(0, PRECISION)
    })
})

describe('경로 문구', () => {
    test('라벨은 도시와 코드를 함께 보여준다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }])
        expect(formatGlobeRouteLabel(route)).toBe('서울 ICN → 오사카 KIX')
    })

    test('경로가 없으면 대체 설명을 돌려준다', () => {
        expect(describeGlobeRoutes([])).toBe('경로가 표시되지 않은 지구본입니다.')
    })

    test('경로가 있으면 도시 이름으로 설명한다', () => {
        expect(describeGlobeRoutes(resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }]))).toBe('여행 경로 지구본. 서울에서 오사카까지.')
    })
})
