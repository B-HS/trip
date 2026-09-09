import { describe, expect, test } from 'bun:test'
import { Euler, Vector3 } from 'three'
import { coastlinePositions, graticulePositions, isLandCoordinate, landDotPositions, landGridPoints } from '@/shared/ui/three/globe-geography'
import { airportsFacingRotation, collectGlobeAirports, latLngToVector3, resolveGlobeRoutes } from '@/shared/ui/three/globe-math'

const VECTOR_COMPONENTS = 3
const PRECISION = 2
const OCEAN_PROBE_STEP = 2

const lengthAt = (positions: Float32Array, index: number) =>
    Math.hypot(positions[index * VECTOR_COMPONENTS], positions[index * VECTOR_COMPONENTS + 1], positions[index * VECTOR_COMPONENTS + 2])

describe('coastlinePositions', () => {
    const positions = coastlinePositions()

    test('해안선 세그먼트가 만들어진다', () => {
        expect(positions.length).toBeGreaterThan(0)
        expect(positions.length % (VECTOR_COMPONENTS * 2)).toBe(0)
        expect(positions.length / (VECTOR_COMPONENTS * 2)).toBeGreaterThan(1000)
    })

    test('모든 정점이 지구본 표면 위에 놓인다', () => {
        const count = positions.length / VECTOR_COMPONENTS
        expect(lengthAt(positions, 0)).toBeCloseTo(1, PRECISION)
        expect(lengthAt(positions, Math.floor(count / 2))).toBeCloseTo(1, PRECISION)
        expect(lengthAt(positions, count - 1)).toBeCloseTo(1, PRECISION)
    })
})

describe('isLandCoordinate', () => {
    test('대륙 위 좌표는 육지로 판정한다', () => {
        expect(isLandCoordinate(126.98, 37.57)).toBe(true)
        expect(isLandCoordinate(10, 25)).toBe(true)
        expect(isLandCoordinate(-100, 40)).toBe(true)
    })

    test('대양 위 좌표는 육지가 아니다', () => {
        expect(isLandCoordinate(-140, -30)).toBe(false)
        expect(isLandCoordinate(-30, 0)).toBe(false)
        expect(isLandCoordinate(80, -40)).toBe(false)
    })
})

describe('landDotPositions', () => {
    test('육지 격자점이 만들어진다', () => {
        expect(landGridPoints().length).toBeGreaterThan(0)
        expect(landDotPositions(1).length).toBeGreaterThan(0)
        expect(landDotPositions(1).length % VECTOR_COMPONENTS).toBe(0)
    })

    test('stride 를 키우면 점이 줄어든다', () => {
        expect(landDotPositions(2).length).toBeLessThan(landDotPositions(1).length)
    })

    test('대양만 훑는 격자에서는 점이 하나도 나오지 않는다', () => {
        const oceanPoints: [number, number][] = []
        for (let lat = -40; lat <= -20; lat += OCEAN_PROBE_STEP) {
            for (let lng = -140; lng <= -120; lng += OCEAN_PROBE_STEP) oceanPoints.push([lng, lat])
        }
        expect(oceanPoints.length).toBeGreaterThan(0)
        expect(oceanPoints.filter(([lng, lat]) => isLandCoordinate(lng, lat))).toHaveLength(0)
    })

    test('육지 격자점은 모두 육지 판정을 통과한다', () => {
        expect(landGridPoints().every((point) => isLandCoordinate(point.lng, point.lat))).toBe(true)
    })
})

describe('graticulePositions', () => {
    test('경위선 격자가 만들어진다', () => {
        const positions = graticulePositions()
        expect(positions.length).toBeGreaterThan(0)
        expect(positions.length % (VECTOR_COMPONENTS * 2)).toBe(0)
        expect(lengthAt(positions, 0)).toBeCloseTo(1, PRECISION)
    })
})

describe('마커 중심 방향', () => {
    test('경로 공항들의 중심이 카메라를 향하도록 회전한다', () => {
        const airports = collectGlobeAirports(
            resolveGlobeRoutes([
                { from: 'ICN', to: 'CDG' },
                { from: 'CDG', to: 'FCO' },
            ]),
        )
        const rotation = airportsFacingRotation(airports)
        const centroid = airports
            .reduce((total, airport) => total.add(latLngToVector3(airport.lat, airport.lng, 1)), new Vector3())
            .normalize()
            .applyEuler(new Euler(rotation.x, rotation.y, 0))
        expect(centroid.z).toBeCloseTo(1, 6)
    })

    test('중심 방향은 각 공항 사이의 경도에 놓인다', () => {
        const airports = collectGlobeAirports(resolveGlobeRoutes([{ from: 'ICN', to: 'HND' }]))
        const rotation = airportsFacingRotation(airports)
        const seoul = latLngToVector3(37.4602, 126.4407, 1).applyEuler(new Euler(rotation.x, rotation.y, 0))
        const tokyo = latLngToVector3(35.5494, 139.7798, 1).applyEuler(new Euler(rotation.x, rotation.y, 0))
        expect(seoul.x).toBeLessThan(0)
        expect(tokyo.x).toBeGreaterThan(0)
        expect(seoul.z).toBeGreaterThan(0)
        expect(tokyo.z).toBeGreaterThan(0)
    })
})
