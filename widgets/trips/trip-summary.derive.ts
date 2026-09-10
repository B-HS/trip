import dayjs from 'dayjs'
import type { TripSummary } from '@/entities/trip/trip.type'
import type { TripStatus } from '@/features/trips/trip-status'
import { AIRPORTS, asAirportCode, isAirportCode } from '@/shared/constant/airports'
import { COUNTRIES, isCountryCode } from '@/shared/constant/countries'
import { HOME_AIRPORT_CODE } from '@/shared/constant/trip'
import { formatTripDateRange } from '@/shared/lib/trip-date-range'
import type { GlobeEndpointInput, GlobePointInput } from '@/shared/ui/three/globe-math'

const DAY_UNIT = 'day'
const ROUTE_KEY_SEPARATOR = '-'
const ROUTE_ARROW = ' → '
const ROUTE_LABEL_SEPARATOR = ' · '
const TRIP_SUMMARY_SEPARATOR = ', '
const MAX_DESCRIBED_TRIPS = 3

type TripPeriod = Pick<TripSummary, 'startDate' | 'endDate'>

type TripDestinationLabel = TripSummary['destinations'][number]

type TripRouteEndpoint = { code: string; label: string; endpoint: GlobeEndpointInput }

export const deriveTripStatus = ({ startDate, endDate }: TripPeriod, today: string | null): TripStatus | null => {
    if (today === null) return null
    const current = dayjs(today)
    const start = dayjs(startDate)
    if (current.isBefore(start, DAY_UNIT)) return { tone: 'upcoming', label: `예정 D-${start.diff(current, DAY_UNIT)}` }
    if (current.isAfter(dayjs(endDate), DAY_UNIT)) return { tone: 'done', label: '완료' }
    return { tone: 'ongoing', label: '진행 중' }
}

export const countOngoingTrips = (trips: TripSummary[], today: string | null) =>
    trips.filter((trip) => deriveTripStatus(trip, today)?.tone === 'ongoing').length

const resolveDestination = (destination: TripDestinationLabel) => {
    if (!isCountryCode(destination.countryCode)) return null
    const country = COUNTRIES[destination.countryCode]
    return { code: destination.countryCode, label: destination.city ?? country.name, lat: country.lat, lng: country.lng }
}

export const toDestinationPoint = (destination: TripDestinationLabel): GlobePointInput | null => {
    const resolved = resolveDestination(destination)
    return resolved === null ? null : { lat: resolved.lat, lng: resolved.lng, label: `${resolved.code} ${resolved.label}` }
}

const toDestinationEndpoint = (destination: TripDestinationLabel): TripRouteEndpoint | null => {
    const resolved = resolveDestination(destination)
    const point = toDestinationPoint(destination)
    if (resolved === null || point === null) return null
    return { code: resolved.code, label: resolved.label, endpoint: point }
}

const toAirportEndpoint = (code: string): TripRouteEndpoint => {
    const normalized = code.trim().toUpperCase()
    return { code: normalized, label: isAirportCode(normalized) ? AIRPORTS[normalized].city : normalized, endpoint: normalized }
}

const toRouteSegment = (from: TripRouteEndpoint, to: TripRouteEndpoint) => ({
    key: `${from.code}${ROUTE_KEY_SEPARATOR}${to.code}`,
    codeLabel: `${from.code}${ROUTE_ARROW}${to.code}`,
    label: `${from.code}${ROUTE_ARROW}${to.code}${ROUTE_LABEL_SEPARATOR}${from.label}${ROUTE_ARROW}${to.label}`,
    from: from.endpoint,
    to: to.endpoint,
})

export type TripRouteSegment = ReturnType<typeof toRouteSegment>

export type TripGlobeRoute = TripRouteSegment & { description: string; tripIds: string[] }

export const buildDestinationRoutes = (destinations: readonly TripDestinationLabel[], departureAirportCode: string | null) => {
    const endpoints = destinations.flatMap((destination) => {
        const endpoint = toDestinationEndpoint(destination)
        return endpoint === null ? [] : [endpoint]
    })
    if (endpoints.length === 0) return []
    const chain = [toAirportEndpoint(asAirportCode(departureAirportCode) ?? HOME_AIRPORT_CODE), ...endpoints]
    return chain.slice(1).map((to, index) => toRouteSegment(chain[index], to))
}

export const buildFlightRoutes = (flights: TripSummary['flights']) =>
    flights.map((flight) => toRouteSegment(toAirportEndpoint(flight.departCode), toAirportEndpoint(flight.arriveCode)))

const describeRouteTrips = (summaries: readonly string[]) => {
    const shown = summaries.slice(0, MAX_DESCRIBED_TRIPS)
    const hidden = summaries.length - shown.length
    const described = shown.join(TRIP_SUMMARY_SEPARATOR)
    return hidden === 0 ? described : `${described}${TRIP_SUMMARY_SEPARATOR}외 ${hidden}개`
}

export const collectGlobeRoutes = (trips: readonly TripSummary[]): TripGlobeRoute[] => {
    const routes = new Map<string, TripRouteSegment & { tripIds: string[]; summaries: string[] }>()
    for (const trip of trips) {
        const segments =
            trip.flights.length > 0 ? buildFlightRoutes(trip.flights) : buildDestinationRoutes(trip.destinations, trip.departureAirportCode)
        const summary = `${trip.title}${ROUTE_LABEL_SEPARATOR}${formatTripDateRange(trip)}`
        for (const segment of segments) {
            const existing = routes.get(segment.key)
            if (existing?.tripIds.includes(trip.id)) continue
            routes.set(segment.key, {
                ...(existing ?? segment),
                tripIds: [...(existing?.tripIds ?? []), trip.id],
                summaries: [...(existing?.summaries ?? []), summary],
            })
        }
    }
    return [...routes.values()].map(({ summaries, ...route }) => ({ ...route, description: describeRouteTrips(summaries) }))
}

export const findGlobeRoute = (routes: readonly TripGlobeRoute[], key: string | null) =>
    key === null ? null : (routes.find((route) => route.key === key) ?? null)

export const filterTripsByRoute = (trips: TripSummary[], route: TripGlobeRoute | null) =>
    route === null ? trips : trips.filter((trip) => route.tripIds.includes(trip.id))
