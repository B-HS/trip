import { Vector3 } from 'three'
import { AIRPORTS, isAirportCode } from '@/shared/constant/airports'

const DEGREE_TO_RADIAN = Math.PI / 180
const MIN_ARC_SEGMENTS = 2
const DEGENERATE_ANGLE_EPSILON = 1e-6
const MAX_LATITUDE = 90
const MAX_LONGITUDE = 180

export type GlobePointInput = { lat: number; lng: number; label: string }

export type GlobeEndpointInput = string | GlobePointInput

export type GlobeRouteInput = { from: GlobeEndpointInput; to: GlobeEndpointInput; key?: string; label?: string; description?: string }

export type GlobePoint = { key: string; code: string | null; label: string; lat: number; lng: number }

export type GlobeAirport = GlobePoint

export type GlobeRoute = { key: string; from: GlobePoint; to: GlobePoint; label: string | null; description: string | null }

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
 * Euler x/y rotation that brings the given direction to face the default camera at +z.
 * The y rotation swings the direction onto the y-z plane, the x rotation lifts it onto +z.
 */
export const globeFacingRotation = (direction: Vector3) => ({
    x: Math.atan2(direction.y, Math.hypot(direction.x, direction.z)),
    y: -Math.atan2(direction.x, direction.z),
})

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

const isCoordinate = (value: number, limit: number) => Number.isFinite(value) && Math.abs(value) <= limit

const resolveAirportEndpoint = (code: string): GlobePoint | null => {
    const normalized = code.trim().toUpperCase()
    if (!isAirportCode(normalized)) return null
    const airport = AIRPORTS[normalized]
    return { key: normalized, code: normalized, label: airport.city, lat: airport.lat, lng: airport.lng }
}

const resolvePointEndpoint = (point: GlobePointInput): GlobePoint | null => {
    const label = point.label.trim()
    if (label.length === 0 || !isCoordinate(point.lat, MAX_LATITUDE) || !isCoordinate(point.lng, MAX_LONGITUDE)) return null
    return { key: `${label}@${point.lat},${point.lng}`, code: null, label, lat: point.lat, lng: point.lng }
}

const resolveEndpoint = (endpoint: GlobeEndpointInput) =>
    typeof endpoint === 'string' ? resolveAirportEndpoint(endpoint) : resolvePointEndpoint(endpoint)

/**
 * Maps route endpoints — IATA codes or explicit coordinates — onto globe points,
 * dropping unknown endpoints, self routes and duplicates.
 */
export const resolveGlobeRoutes = (routes: readonly GlobeRouteInput[]) => {
    const seen = new Set<string>()
    return routes.flatMap((route) => {
        const from = resolveEndpoint(route.from)
        const to = resolveEndpoint(route.to)
        if (!from || !to || from.key === to.key) return []
        const key = route.key ?? `${from.key}-${to.key}`
        if (seen.has(key)) return []
        seen.add(key)
        return [{ key, from, to, label: route.label ?? null, description: route.description ?? null }]
    })
}

export const collectGlobeAirports = (routes: readonly GlobeRoute[]) => {
    const byKey = new Map<string, GlobePoint>()
    routes.forEach((route) => {
        byKey.set(route.from.key, route.from)
        byKey.set(route.to.key, route.to)
    })
    return [...byKey.values()]
}

/**
 * Rotation that points the mean direction of the given points at the camera.
 */
export const airportsFacingRotation = (points: readonly GlobePoint[]) => {
    const mean = points.reduce((total, point) => total.add(latLngToVector3(point.lat, point.lng, 1)), new Vector3())
    return mean.lengthSq() < DEGENERATE_ANGLE_EPSILON ? { x: 0, y: 0 } : globeFacingRotation(mean.normalize())
}

export const buildGlobeArc = (route: GlobeRoute, radius: number, segments: number, lift: number) =>
    greatCircleArc(
        latLngToVector3(route.from.lat, route.from.lng, radius),
        latLngToVector3(route.to.lat, route.to.lng, radius),
        radius,
        segments,
        lift,
    )

const formatGlobePoint = (point: GlobePoint) => (point.code === null ? point.label : `${point.label} ${point.code}`)

export const formatGlobeRouteLabel = (route: GlobeRoute) => route.label ?? `${formatGlobePoint(route.from)} → ${formatGlobePoint(route.to)}`

/**
 * True when a sphere centred on the origin hides the given point from the eye position.
 * Used to ignore pointer hits on arcs drawn behind the globe.
 */
export const isHiddenBySphere = (point: Vector3, eye: Vector3, radius: number) => {
    const toPoint = point.clone().sub(eye)
    const lengthSq = toPoint.lengthSq()
    if (lengthSq < DEGENERATE_ANGLE_EPSILON) return false
    const closestRatio = -eye.dot(toPoint) / lengthSq
    if (closestRatio <= 0 || closestRatio >= 1) return false
    return eye.clone().addScaledVector(toPoint, closestRatio).lengthSq() < radius * radius
}

export const describeGlobeRoutes = (routes: readonly GlobeRoute[]) =>
    routes.length === 0
        ? '경로가 표시되지 않은 지구본입니다.'
        : `여행 경로 지구본. ${routes.map((route) => `${route.from.label}에서 ${route.to.label}까지`).join(', ')}.`
