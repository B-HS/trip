import 'server-only'
import { unstable_cache } from 'next/cache'
import { findFavoriteTrips } from '@/entities/trip/trip.repository.favorites'
import { findPublicTripBySlug, findTripDetail, findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { tripShareTag } from '@/entities/trip/trip.tag'

const PUBLIC_TRIP_REVALIDATE_SECONDS = 60 * 60
const PUBLIC_TRIP_CACHE_VERSION = '3'

export const getTripList = (userId: string) => findTripSummariesForUser(userId)

export const getFavoriteTrips = (userId: string) => findFavoriteTrips(userId)

export const getTripDetail = (tripId: string) => findTripDetail(tripId)

export const getPublicTrip = (slug: string) =>
    unstable_cache(() => findPublicTripBySlug(slug), ['public-trip', PUBLIC_TRIP_CACHE_VERSION, slug], {
        tags: [tripShareTag(slug)],
        revalidate: PUBLIC_TRIP_REVALIDATE_SECONDS,
    })()
