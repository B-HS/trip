import { Vector3 } from 'three'
import { AIRPORTS, type AirportCode, isAirportCode } from '@/shared/constant/airports'

const DEGREE_TO_RADIAN = Math.PI / 180
const MIN_ARC_SEGMENTS = 2
const DEGENERATE_ANGLE_EPSILON = 1e-6

export type GlobeRouteInput = { from: string; to: string }

export type GlobeAirport = { code: AirportCode; name: string; city: string; lat: number; lng: number }

export type GlobeRoute = { key: string; from: GlobeAirport; to: GlobeAirport }

/**
 * Projects a geographic coordinate onto a sphere of the given radius.
 * Longitude 0 / latitude 0 maps to the +x axis, the north pole to +y and 90°E to -z.
 */
export const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const latRadian = lat * DEGREE_TO_RADIAN
    const lngRadian = lng * DEGREE_TO_RADIAN
    const ringRadius = Math.cos(latRadian) * radius
    return new Vector3(ringRadius * Math.cos(lngRadian), radius * Math.sin(latRadian), -ringRadius * Math.sin(lngRadian))
}

/**
 * Rotation around the y axis that brings the given longitude to face the default camera at +z.
 */
export const longitudeFacingRotation = (lng: number) => {
    const lngRadian = lng * DEGREE_TO_RADIAN
    return -Math.atan2(Math.cos(lngRadian), -Math.sin(lngRadian))
}

/**
 * Samples the great-circle path between two points, lifting the middle of the arc off the surface.
 * The first and last samples sit exactly on the sphere of the given radius.
 */
export const greatCircleArc = (from: Vector3, to: Vector3, radius: number, segments: number, lift: number) => {
    const steps = Math.max(MIN_ARC_SEGMENTS, Math.round(segments))
    const start = from.clone().normalize()
    const end = to.clone().normalize()
    const angle = Math.acos(Math.min(1, Math.max(-1, start.dot(end))))
    const sinAngle = Math.sin(angle)

    return Array.from({ length: steps + 1 }, (_, index) => {
        const progress = index / steps
        const point =
            sinAngle < DEGENERATE_ANGLE_EPSILON
                ? start.clone().lerp(end, progress)
                : start
                      .clone()
                      .multiplyScalar(Math.sin((1 - progress) * angle) / sinAngle)
                      .addScaledVector(end, Math.sin(progress * angle) / sinAngle)
        return point.setLength(radius + lift * Math.sin(Math.PI * progress))
    })
}

const toGlobeAirport = (code: AirportCode): GlobeAirport => ({ code, ...AIRPORTS[code] })

const resolveAirport = (code: string) => {
    const normalized = code.trim().toUpperCase()
    return isAirportCode(normalized) ? toGlobeAirport(normalized) : null
}

/**
 * Maps IATA code pairs onto known airports, dropping unknown codes, self routes and duplicates.
 */
export const resolveGlobeRoutes = (routes: readonly GlobeRouteInput[]) => {
    const seen = new Set<string>()
    return routes.flatMap((route) => {
        const from = resolveAirport(route.from)
        const to = resolveAirport(route.to)
        if (!from || !to || from.code === to.code) return []
        const key = `${from.code}-${to.code}`
        if (seen.has(key)) return []
        seen.add(key)
        return [{ key, from, to }]
    })
}

export const collectGlobeAirports = (routes: readonly GlobeRoute[]) => {
    const byCode = new Map<AirportCode, GlobeAirport>()
    routes.forEach((route) => {
        byCode.set(route.from.code, route.from)
        byCode.set(route.to.code, route.to)
    })
    return [...byCode.values()]
}

export const buildGlobeArc = (route: GlobeRoute, radius: number, segments: number, lift: number) =>
    greatCircleArc(
        latLngToVector3(route.from.lat, route.from.lng, radius),
        latLngToVector3(route.to.lat, route.to.lng, radius),
        radius,
        segments,
        lift,
    )

export const formatGlobeRouteLabel = (route: GlobeRoute) => `${route.from.city} ${route.from.code} → ${route.to.city} ${route.to.code}`

export const describeGlobeRoutes = (routes: readonly GlobeRoute[]) =>
    routes.length === 0
        ? '경로가 표시되지 않은 지구본입니다.'
        : `여행 경로 지구본. ${routes.map((route) => `${route.from.city}에서 ${route.to.city}까지`).join(', ')}.`
