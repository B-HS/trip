import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import type { TripSummary } from '@/entities/trip/trip.type'
import type { TripStatus } from '@/features/trips/trip-status'
import type { GlobeRouteInput } from '@/shared/ui/three/globe-math'

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

export const collectGlobeRoutes = (trips: TripSummary[]) => {
    const routes = new Map<string, GlobeRouteInput>()
    for (const trip of trips) {
        for (const flight of trip.flights) {
            routes.set(`${flight.departCode}-${flight.arriveCode}`, { from: flight.departCode, to: flight.arriveCode })
        }
    }
    return [...routes.values()]
}
