import type { FlightDirection } from '@/shared/constant/trip'

const OUTBOUND: FlightDirection = 'outbound'
const ROUTE_SEPARATOR = ' → '

export type TripRouteFlight = {
    direction: FlightDirection
    departCode: string
    arriveCode: string
}

export const resolveTripRouteLabel = (flights: readonly TripRouteFlight[]) => {
    const flight = flights.find((item) => item.direction === OUTBOUND) ?? flights[0]
    if (!flight) return null
    return `${flight.departCode}${ROUTE_SEPARATOR}${flight.arriveCode}`
}
