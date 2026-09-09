import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { findPublicTripIdBySlug, findTripDetail, findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { tripListTag, tripShareTag, tripTag } from '@/entities/trip/trip.tag'

export const getCachedTripList = async (userId: string) => {
    'use cache'
    cacheLife('days')
    cacheTag(tripListTag(userId))
    return findTripSummariesForUser(userId)
}

export const getCachedTripDetail = async (tripId: string) => {
    'use cache'
    cacheLife('days')
    cacheTag(tripTag(tripId))
    return findTripDetail(tripId)
}

const getCachedPublicTripId = async (slug: string) => {
    'use cache'
    cacheLife('hours')
    cacheTag(tripShareTag(slug))
    return findPublicTripIdBySlug(slug)
}

export const getCachedPublicTrip = async (slug: string) => {
    const tripId = await getCachedPublicTripId(slug)
    if (tripId === null) return null
    return getCachedTripDetail(tripId)
}
