import 'server-only'
import { and, asc, desc, eq } from 'drizzle-orm'
import { findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { lockTrip, touchTrip } from '@/entities/trip/trip.repository.days'
import { getDb } from '@/shared/db/client'
import { tripFavorite } from '@/shared/db/schema/trip'

const FIRST_SORT_ORDER = 0

const findFavoriteTripIds = async (userId: string) =>
    getDb()
        .select({ tripId: tripFavorite.tripId })
        .from(tripFavorite)
        .where(eq(tripFavorite.userId, userId))
        .orderBy(asc(tripFavorite.sortOrder), asc(tripFavorite.createdAt))

export const findFavoriteTrips = async (userId: string) => {
    const favorites = await findFavoriteTripIds(userId)
    if (favorites.length === 0) return []
    const summaries = await findTripSummariesForUser(userId)
    const byId = new Map(summaries.map((summary) => [summary.id, summary]))
    return favorites.flatMap((favorite) => {
        const summary = byId.get(favorite.tripId)
        return summary === undefined ? [] : [summary]
    })
}

export const setTripFavorite = async (userId: string, tripId: string, isFavorite: boolean) => {
    const db = getDb()
    await db.transaction(async (tx) => {
        await lockTrip(tx, tripId)
        if (!isFavorite) {
            await tx.delete(tripFavorite).where(and(eq(tripFavorite.userId, userId), eq(tripFavorite.tripId, tripId)))
            await touchTrip(tx, tripId)
            return
        }
        const [last] = await tx
            .select({ sortOrder: tripFavorite.sortOrder })
            .from(tripFavorite)
            .where(eq(tripFavorite.userId, userId))
            .orderBy(desc(tripFavorite.sortOrder))
            .limit(1)
        const sortOrder = last === undefined ? FIRST_SORT_ORDER : last.sortOrder + 1
        await tx.insert(tripFavorite).values({ userId, tripId, sortOrder }).onDuplicateKeyUpdate({ set: { tripId } })
        await touchTrip(tx, tripId)
    })
}
