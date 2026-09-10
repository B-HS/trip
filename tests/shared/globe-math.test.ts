import { describe, expect, test } from 'bun:test'
import { Euler, Vector3 } from 'three'
import {
    airportsFacingRotation,
    buildGlobeArc,
    collectGlobeAirports,
    describeGlobeRoutes,
    formatGlobeRouteLabel,
    globeFacingRotation,
    greatCircleArc,
    isHiddenBySphere,
    latLngToVector3,
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

describe('globeFacingRotation', () => {
    test('회전을 적용하면 해당 방향이 +z 를 향한다', () => {
        const direction = latLngToVector3(37.4602, 126.4407, 1)
        const rotation = globeFacingRotation(direction)
        const faced = direction.clone().applyEuler(new Euler(rotation.x, rotation.y, 0))
        expect(faced.z).toBeCloseTo(1, PRECISION)
        expect(faced.x).toBeCloseTo(0, PRECISION)
        expect(faced.y).toBeCloseTo(0, PRECISION)
    })

    test('적도 위 지점은 y 회전만 필요하다', () => {
        expect(globeFacingRotation(latLngToVector3(0, -73.7781, 1)).x).toBeCloseTo(0, PRECISION)
    })
})

describe('airportsFacingRotation', () => {
    test('공항들의 평균 방향이 카메라를 향한다', () => {
        const airports = collectGlobeAirports(resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }]))
        const rotation = airportsFacingRotation(airports)
        const centroid = airports
            .reduce((total, airport) => total.add(latLngToVector3(airport.lat, airport.lng, 1)), new Vector3())
            .normalize()
            .applyEuler(new Euler(rotation.x, rotation.y, 0))
        expect(centroid.z).toBeCloseTo(1, PRECISION)
        expect(centroid.x).toBeCloseTo(0, PRECISION)
        expect(centroid.y).toBeCloseTo(0, PRECISION)
    })

    test('공항이 하나면 그 공항이 정면에 온다', () => {
        const [airport] = collectGlobeAirports(resolveGlobeRoutes([{ from: 'JFK', to: 'LHR' }]))
        const rotation = airportsFacingRotation([airport])
        const faced = latLngToVector3(airport.lat, airport.lng, 1).applyEuler(new Euler(rotation.x, rotation.y, 0))
        expect(faced.z).toBeCloseTo(1, PRECISION)
    })

    test('공항이 없거나 방향이 상쇄되면 회전하지 않는다', () => {
        expect(airportsFacingRotation([])).toEqual({ x: 0, y: 0 })
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

describe('좌표 엔드포인트', () => {
    const osaka = { lat: 34.6937, lng: 135.5023, label: 'JP 오사카' }

    test('IATA 코드와 좌표를 섞어 경로를 만든다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: osaka }])
        expect(route.from.code).toBe('ICN')
        expect(route.to.code).toBeNull()
        expect(route.to.label).toBe('JP 오사카')
        expect(route.to.lat).toBeCloseTo(osaka.lat, PRECISION)
    })

    test('같은 라벨·좌표 경로는 한 번만 남는다', () => {
        expect(
            resolveGlobeRoutes([
                { from: 'ICN', to: osaka },
                { from: 'ICN', to: { ...osaka } },
            ]),
        ).toHaveLength(1)
    })

    test('라벨이 비었거나 좌표가 범위를 벗어나면 건너뛴다', () => {
        expect(resolveGlobeRoutes([{ from: 'ICN', to: { ...osaka, label: '  ' } }])).toEqual([])
        expect(resolveGlobeRoutes([{ from: 'ICN', to: { ...osaka, lat: 120 } }])).toEqual([])
        expect(resolveGlobeRoutes([{ from: 'ICN', to: { ...osaka, lng: Number.NaN } }])).toEqual([])
    })

    test('좌표 지점의 라벨은 코드 없이 그대로 쓴다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: osaka }])
        expect(formatGlobeRouteLabel(route)).toBe('서울 ICN → JP 오사카')
        expect(describeGlobeRoutes([route])).toBe('여행 경로 지구본. 서울에서 JP 오사카까지.')
    })

    test('좌표 지점도 마커 목록에 모인다', () => {
        const points = collectGlobeAirports(
            resolveGlobeRoutes([
                { from: 'ICN', to: osaka },
                { from: osaka, to: { lat: 25.033, lng: 121.5654, label: 'TW 타이베이' } },
            ]),
        )
        expect(points.map((point) => point.label)).toEqual(['서울', 'JP 오사카', 'TW 타이베이'])
    })
})

describe('경로 표시 정보', () => {
    const tokyo = { lat: 35.6762, lng: 139.6503, label: 'JP 도쿄' }

    test('넘겨준 키·라벨·설명을 그대로 쓴다', () => {
        const [route] = resolveGlobeRoutes([
            { from: 'ICN', to: 'KIX', key: 'ICN-KIX', label: 'ICN → KIX · 서울 → 오사카', description: '오사카 여행 노트' },
        ])
        expect(route.key).toBe('ICN-KIX')
        expect(route.description).toBe('오사카 여행 노트')
        expect(formatGlobeRouteLabel(route)).toBe('ICN → KIX · 서울 → 오사카')
    })

    test('키를 넘기면 그 키로 중복을 걸러낸다', () => {
        const routes = resolveGlobeRoutes([
            { from: 'ICN', to: tokyo, key: 'ICN-JP' },
            { from: 'ICN', to: { ...tokyo, label: 'JP 오사카' }, key: 'ICN-JP' },
        ])
        expect(routes).toHaveLength(1)
        expect(routes[0].to.label).toBe('JP 도쿄')
    })

    test('라벨과 설명을 넘기지 않으면 비어 있고 라벨은 도시·코드로 만든다', () => {
        const [route] = resolveGlobeRoutes([{ from: 'ICN', to: 'KIX' }])
        expect(route.label).toBeNull()
        expect(route.description).toBeNull()
        expect(formatGlobeRouteLabel(route)).toBe('서울 ICN → 오사카 KIX')
    })
})

describe('isHiddenBySphere', () => {
    const eye = new Vector3(0, 0, 3)
    const RADIUS = 1

    test('카메라를 향한 면의 점은 가려지지 않는다', () => {
        expect(isHiddenBySphere(new Vector3(0, 0, 1), eye, RADIUS)).toBe(false)
    })

    test('구 뒤편의 점은 가려진다', () => {
        expect(isHiddenBySphere(new Vector3(0, 0, -1), eye, RADIUS)).toBe(true)
        expect(isHiddenBySphere(new Vector3(1, 0, 0), eye, RADIUS)).toBe(true)
    })

    test('카메라보다 앞에 있는 점은 가려지지 않는다', () => {
        expect(isHiddenBySphere(new Vector3(0, 0, 4), eye, RADIUS)).toBe(false)
    })

    test('카메라와 같은 자리의 점은 가려지지 않는다', () => {
        expect(isHiddenBySphere(eye.clone(), eye, RADIUS)).toBe(false)
    })
})
