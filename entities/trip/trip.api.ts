import type { TripDetail, TripMembersView, TripSummary } from '@/entities/trip/trip.type'
import { clientFetch } from '@/shared/lib/fetch'

const TRIPS_PATH = '/api/trips'

export const fetchTripList = () => clientFetch<TripSummary[]>(TRIPS_PATH)

export const fetchTripDetail = (tripId: string) => clientFetch<TripDetail>(`${TRIPS_PATH}/${tripId}`)

export const fetchTripMembers = (tripId: string) => clientFetch<TripMembersView>(`${TRIPS_PATH}/${tripId}/members`)
