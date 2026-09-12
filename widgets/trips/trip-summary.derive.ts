import dayjs from 'dayjs'
import type { TripSummary } from '@/entities/trip/trip.type'
import type { TripStatusTone } from '@/features/trips/trip-status'
import { AIRPORTS, asAirportCode, isAirportCode } from '@/shared/constant/airports'
import { COUNTRIES, countryName, isCountryCode } from '@/shared/constant/countries'
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

export const deriveTripStatus = ({ startDate, endDate }: TripPeriod, today: string | null): TripStatusTone | null => {
    if (today === null) return null
    const current = dayjs(today)
    const start = dayjs(startDate)
    if (current.isBefore(start, DAY_UNIT)) return 'upcoming'
    if (current.isAfter(dayjs(endDate), DAY_UNIT)) return 'done'
    return 'ongoing'
}

export const countOngoingTrips = (trips: TripSummary[], today: string | null) =>
    trips.filter((trip) => deriveTripStatus(trip, today) === 'ongoing').length

const resolveDestination = (destination: TripDestinationLabel, locale = 'ko') => {
    if (!isCountryCode(destination.countryCode)) return null
    const country = COUNTRIES[destination.countryCode]
    return {
        code: destination.countryCode,
        label: destination.city ?? countryName(destination.countryCode, locale),
        lat: country.lat,
        lng: country.lng,
    }
}

export const toDestinationPoint = (destination: TripDestinationLabel, locale = 'ko'): GlobePointInput | null => {
    const resolved = resolveDestination(destination, locale)
    return resolved === null ? null : { lat: resolved.lat, lng: resolved.lng, label: `${resolved.code} ${resolved.label}` }
}

const toDestinationEndpoint = (destination: TripDestinationLabel, locale = 'ko'): TripRouteEndpoint | null => {
    const resolved = resolveDestination(destination, locale)
    const point = toDestinationPoint(destination, locale)
    if (resolved === null || point === null) return null
    return { code: resolved.code, label: resolved.label, endpoint: point }
}

const toAirportEndpoint = (code: string, locale = 'ko'): TripRouteEndpoint => {
    const normalized = code.trim().toUpperCase()
    return {
        code: normalized,
        label: isAirportCode(normalized) && locale === 'ko' ? AIRPORTS[normalized].city : normalized,
        endpoint: normalized,
    }
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

export const buildDestinationRoutes = (destinations: readonly TripDestinationLabel[], departureAirportCode: string | null, locale = 'ko') => {
    const endpoints = destinations.flatMap((destination) => {
        const endpoint = toDestinationEndpoint(destination, locale)
        return endpoint === null ? [] : [endpoint]
    })
    if (endpoints.length === 0) return []
    const chain = [toAirportEndpoint(asAirportCode(departureAirportCode) ?? HOME_AIRPORT_CODE, locale), ...endpoints]
    return chain.slice(1).map((to, index) => toRouteSegment(chain[index], to))
}

export const buildFlightRoutes = (flights: TripSummary['flights'], locale = 'ko') =>
    flights.map((flight) => toRouteSegment(toAirportEndpoint(flight.departCode, locale), toAirportEndpoint(flight.arriveCode, locale)))

const describeRouteTrips = (summaries: readonly string[], locale = 'ko') => {
    const shown = summaries.slice(0, MAX_DESCRIBED_TRIPS)
    const hidden = summaries.length - shown.length
    const described = shown.join(TRIP_SUMMARY_SEPARATOR)
    if (hidden === 0) return described
    if (locale === 'en') return `${described}${TRIP_SUMMARY_SEPARATOR}and ${hidden} more`
    return `${described}${TRIP_SUMMARY_SEPARATOR}${locale === 'ja' ? `他${hidden}件` : `외 ${hidden}개`}`
}

export const collectGlobeRoutes = (trips: readonly TripSummary[], locale = 'ko'): TripGlobeRoute[] => {
    const routes = new Map<string, TripRouteSegment & { tripIds: string[]; summaries: string[] }>()
    for (const trip of trips) {
        const segments =
            trip.flights.length > 0
                ? buildFlightRoutes(trip.flights, locale)
                : buildDestinationRoutes(trip.destinations, trip.departureAirportCode, locale)
        const summary = `${trip.title}${ROUTE_LABEL_SEPARATOR}${formatTripDateRange(trip, locale)}`
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
    return [...routes.values()].map(({ summaries, ...route }) => ({ ...route, description: describeRouteTrips(summaries, locale) }))
}

export const findGlobeRoute = (routes: readonly TripGlobeRoute[], key: string | null) =>
    key === null ? null : (routes.find((route) => route.key === key) ?? null)

export const filterTripsByRoute = (trips: TripSummary[], route: TripGlobeRoute | null) =>
    route === null ? trips : trips.filter((trip) => route.tripIds.includes(trip.id))
