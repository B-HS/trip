import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import type { TripSummary } from '@/entities/trip/trip.type'
import type { TripStatus } from '@/features/trips/trip-status'
import { COUNTRIES, isCountryCode } from '@/shared/constant/countries'
import { HOME_AIRPORT_CODE } from '@/shared/constant/trip'
import type { GlobeEndpointInput, GlobePointInput, GlobeRouteInput } from '@/shared/ui/three/globe-math'

const DATE_LOCALE = 'ko'
const DAY_UNIT = 'day'
const START_FORMAT = 'YYYY.MM.DD'
const END_FORMAT = 'MM.DD'
const WEEKDAY_FORMAT = 'dd'
const RANGE_SEPARATOR = ' – '
const WEEKDAY_SEPARATOR = '–'
const ROUTE_SEPARATOR = ' → '
const OUTBOUND = 'outbound'

type TripPeriod = Pick<TripSummary, 'startDate' | 'endDate'>

type TripDestinationLabel = TripSummary['destinations'][number]

export const formatTripDateRange = ({ startDate, endDate }: TripPeriod) => {
    const start = dayjs(startDate).locale(DATE_LOCALE)
    const end = dayjs(endDate).locale(DATE_LOCALE)
    const weekdays = `${start.format(WEEKDAY_FORMAT)}${WEEKDAY_SEPARATOR}${end.format(WEEKDAY_FORMAT)}`
    return `${start.format(START_FORMAT)}${RANGE_SEPARATOR}${end.format(END_FORMAT)} (${weekdays})`
}

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

export const resolveTripRouteLabel = (flights: TripSummary['flights']) => {
    const flight = flights.find((item) => item.direction === OUTBOUND) ?? flights[0]
    if (!flight) return null
    return `${flight.departCode}${ROUTE_SEPARATOR}${flight.arriveCode}`
}

export const toDestinationPoint = (destination: TripDestinationLabel): GlobePointInput | null => {
    if (!isCountryCode(destination.countryCode)) return null
    const country = COUNTRIES[destination.countryCode]
    return { lat: country.lat, lng: country.lng, label: `${destination.countryCode} ${destination.city ?? country.name}` }
}

export const buildDestinationRoutes = (destinations: readonly TripDestinationLabel[]) => {
    const points = destinations.flatMap((destination) => {
        const point = toDestinationPoint(destination)
        return point === null ? [] : [point]
    })
    if (points.length === 0) return []
    const chain: GlobeEndpointInput[] = [HOME_AIRPORT_CODE, ...points]
    return chain.slice(1).map((to, index) => ({ from: chain[index], to }) satisfies GlobeRouteInput)
}

const endpointKey = (endpoint: GlobeEndpointInput) => (typeof endpoint === 'string' ? endpoint : endpoint.label)

export const collectGlobeRoutes = (trips: TripSummary[]) => {
    const routes = new Map<string, GlobeRouteInput>()
    for (const trip of trips) {
        const tripRoutes =
            trip.flights.length > 0
                ? trip.flights.map((flight) => ({ from: flight.departCode, to: flight.arriveCode }) satisfies GlobeRouteInput)
                : buildDestinationRoutes(trip.destinations)
        for (const route of tripRoutes) routes.set(`${endpointKey(route.from)}-${endpointKey(route.to)}`, route)
    }
    return [...routes.values()]
}
