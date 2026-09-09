import type { TripUserState } from '@/entities/user-state/user-state.type'
import { clientFetch } from '@/shared/lib/fetch'

export const fetchTripUserState = (tripId: string) => clientFetch<TripUserState>(`/api/trips/${tripId}/user-state`)
