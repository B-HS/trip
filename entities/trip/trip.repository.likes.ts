import 'server-only'
import { and, count, eq } from 'drizzle-orm'
import type { TripLikeState } from '@/entities/trip/trip.type'
import { getDb } from '@/shared/db/client'
import { tripLike } from '@/shared/db/schema/community'
import { trip } from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'

const TRIP_NOT_FOUND = 'error.tripNotFound'

export const findTripIsPublic = async (tripId: string) => {
    const [row] = await getDb().select({ isPublic: trip.isPublic }).from(trip).where(eq(trip.id, tripId)).limit(1)
    return row?.isPublic ?? null
}

export const findTripLikeState = async (tripId: string, userId: string | null) => {
    const [row] = await getDb().select({ likeCount: trip.likeCount }).from(trip).where(eq(trip.id, tripId)).limit(1)
    if (!row) throw new ApiError('NOT_FOUND', TRIP_NOT_FOUND)
    if (userId === null) return { count: row.likeCount, liked: false } satisfies TripLikeState
    const [liked] = await getDb()
        .select({ userId: tripLike.userId })
        .from(tripLike)
        .where(and(eq(tripLike.tripId, tripId), eq(tripLike.userId, userId)))
        .limit(1)
    return { count: row.likeCount, liked: liked !== undefined } satisfies TripLikeState
}

export const setTripLike = async (tripId: string, userId: string, liked: boolean) => {
    const likeCount = await getDb().transaction(async (tx) => {
        const [target] = await tx.select({ updatedAt: trip.updatedAt }).from(trip).where(eq(trip.id, tripId)).limit(1).for('update')
        if (!target) throw new ApiError('NOT_FOUND', TRIP_NOT_FOUND)
        if (liked) await tx.insert(tripLike).values({ tripId, userId }).onDuplicateKeyUpdate({ set: { tripId } })
        else await tx.delete(tripLike).where(and(eq(tripLike.tripId, tripId), eq(tripLike.userId, userId)))
        const [row] = await tx.select({ value: count() }).from(tripLike).where(eq(tripLike.tripId, tripId))
        const value = row?.value ?? 0
        await tx.update(trip).set({ likeCount: value, updatedAt: target.updatedAt }).where(eq(trip.id, tripId))
        return value
    })
    return { count: likeCount, liked } satisfies TripLikeState
}
