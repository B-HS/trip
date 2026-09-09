import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import type { TripUserState } from '@/entities/user-state/user-state.type'
import { getDb } from '@/shared/db/client'
import { tripBooking, tripBookingCheck, tripDay, tripDayMemo, tripScheduleCheck, tripScheduleItem } from '@/shared/db/schema/trip'

export const findTripUserState = async (tripId: string, userId: string) => {
    const db = getDb()
    const [scheduleRows, bookingRows, memoRows] = await Promise.all([
        db
            .select({ id: tripScheduleCheck.scheduleItemId })
            .from(tripScheduleCheck)
            .innerJoin(tripScheduleItem, eq(tripScheduleItem.id, tripScheduleCheck.scheduleItemId))
            .innerJoin(tripDay, eq(tripDay.id, tripScheduleItem.dayId))
            .where(and(eq(tripScheduleCheck.userId, userId), eq(tripDay.tripId, tripId))),
        db
            .select({ id: tripBookingCheck.bookingId })
            .from(tripBookingCheck)
            .innerJoin(tripBooking, eq(tripBooking.id, tripBookingCheck.bookingId))
            .where(and(eq(tripBookingCheck.userId, userId), eq(tripBooking.tripId, tripId))),
        db
            .select({ dayId: tripDayMemo.dayId, content: tripDayMemo.content })
            .from(tripDayMemo)
            .innerJoin(tripDay, eq(tripDay.id, tripDayMemo.dayId))
            .where(and(eq(tripDayMemo.userId, userId), eq(tripDay.tripId, tripId))),
    ])
    return {
        scheduleCheckedIds: scheduleRows.map((row) => row.id),
        bookingCheckedIds: bookingRows.map((row) => row.id),
        memos: Object.fromEntries(memoRows.map((row) => [row.dayId, row.content])),
    } satisfies TripUserState
}

export const findScheduleItemTripId = async (scheduleItemId: string) => {
    const [row] = await getDb()
        .select({ tripId: tripDay.tripId })
        .from(tripScheduleItem)
        .innerJoin(tripDay, eq(tripDay.id, tripScheduleItem.dayId))
        .where(eq(tripScheduleItem.id, scheduleItemId))
    return row?.tripId ?? null
}

export const findBookingTripId = async (bookingId: string) => {
    const [row] = await getDb().select({ tripId: tripBooking.tripId }).from(tripBooking).where(eq(tripBooking.id, bookingId))
    return row?.tripId ?? null
}

export const findDayTripId = async (dayId: string) => {
    const [row] = await getDb().select({ tripId: tripDay.tripId }).from(tripDay).where(eq(tripDay.id, dayId))
    return row?.tripId ?? null
}

export const setScheduleCheck = async (scheduleItemId: string, userId: string, checked: boolean) => {
    const db = getDb()
    if (!checked) {
        await db.delete(tripScheduleCheck).where(and(eq(tripScheduleCheck.scheduleItemId, scheduleItemId), eq(tripScheduleCheck.userId, userId)))
        return
    }
    await db
        .insert(tripScheduleCheck)
        .values({ scheduleItemId, userId })
        .onDuplicateKeyUpdate({ set: { checkedAt: new Date() } })
}

export const setBookingCheck = async (bookingId: string, userId: string, checked: boolean) => {
    const db = getDb()
    if (!checked) {
        await db.delete(tripBookingCheck).where(and(eq(tripBookingCheck.bookingId, bookingId), eq(tripBookingCheck.userId, userId)))
        return
    }
    await db
        .insert(tripBookingCheck)
        .values({ bookingId, userId })
        .onDuplicateKeyUpdate({ set: { checkedAt: new Date() } })
}

export const resetDayChecks = async (dayId: string, userId: string) => {
    const db = getDb()
    const items = await db.select({ id: tripScheduleItem.id }).from(tripScheduleItem).where(eq(tripScheduleItem.dayId, dayId))
    if (items.length === 0) return
    await db.delete(tripScheduleCheck).where(
        and(
            eq(tripScheduleCheck.userId, userId),
            inArray(
                tripScheduleCheck.scheduleItemId,
                items.map((item) => item.id),
            ),
        ),
    )
}

export const upsertDayMemo = async (dayId: string, userId: string, content: string) => {
    await getDb().insert(tripDayMemo).values({ dayId, userId, content }).onDuplicateKeyUpdate({ set: { content } })
}
