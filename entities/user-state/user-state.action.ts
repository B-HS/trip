'use server'

import { assertTripAccess } from '@/entities/trip/trip.access'
import { dayMemoSchema, tripIdSchema } from '@/entities/trip/trip.validate'
import {
    findBookingTripId,
    findDayTripId,
    findScheduleItemTripId,
    resetDayChecks,
    setBookingCheck,
    setScheduleCheck,
    upsertDayMemo,
} from '@/entities/user-state/user-state.repository'
import { runAction } from '@/shared/lib/action-result'
import { ApiError } from '@/shared/lib/api-response'
import { requireUser } from '@/shared/lib/session'

const assertBelongsToTrip = (tripId: string, ownerTripId: string | null) => {
    if (ownerTripId !== tripId) throw new ApiError('NOT_FOUND', 'error.itemNotFound')
}

export const toggleScheduleCheckAction = async (tripId: string, itemId: string, checked: boolean) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        const scheduleItemId = tripIdSchema.parse(itemId)
        await assertTripAccess(id, user.id, 'view')
        assertBelongsToTrip(id, await findScheduleItemTripId(scheduleItemId))
        await setScheduleCheck(scheduleItemId, user.id, checked)
        return { id: scheduleItemId, checked }
    })
}

export const toggleBookingCheckAction = async (tripId: string, bookingId: string, checked: boolean) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        const targetId = tripIdSchema.parse(bookingId)
        await assertTripAccess(id, user.id, 'view')
        assertBelongsToTrip(id, await findBookingTripId(targetId))
        await setBookingCheck(targetId, user.id, checked)
        return { id: targetId, checked }
    })
}

export const resetDayChecksAction = async (tripId: string, dayId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        const targetDayId = tripIdSchema.parse(dayId)
        await assertTripAccess(id, user.id, 'view')
        assertBelongsToTrip(id, await findDayTripId(targetDayId))
        await resetDayChecks(targetDayId, user.id)
        return { id: targetDayId }
    })
}

export const saveDayMemoAction = async (tripId: string, dayId: string, content: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        const targetDayId = tripIdSchema.parse(dayId)
        await assertTripAccess(id, user.id, 'view')
        assertBelongsToTrip(id, await findDayTripId(targetDayId))
        const memo = dayMemoSchema.parse({ content })
        await upsertDayMemo(targetDayId, user.id, memo.content)
        return { id: targetDayId, content: memo.content }
    })
}
