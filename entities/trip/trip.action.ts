'use server'

import { revalidateTag, updateTag } from 'next/cache'
import { assertTripAccess } from '@/entities/trip/trip.access'
import {
    createTrip,
    createTripFromTemplate,
    deleteTrip,
    exportTripTemplate,
    findTripShareSlug,
    saveBookings,
    saveFlights,
    saveInfoSections,
    saveLodgings,
    updateShareSettings,
    updateTripBasics,
} from '@/entities/trip/trip.repository'
import { deleteDay, reorderDays, saveDay } from '@/entities/trip/trip.repository.days'
import { findTripMemberUserIds, inviteMember, removeInvite, removeMember, updateMemberRole } from '@/entities/trip/trip.repository.members'
import { tripListTag, tripShareTag, tripTag } from '@/entities/trip/trip.tag'
import {
    bookingListSchema,
    dayIdListSchema,
    dayInputSchema,
    flightListSchema,
    infoSectionListSchema,
    lodgingListSchema,
    memberInviteSchema,
    memberRoleSchema,
    shareSettingsSchema,
    tripBasicsSchema,
    tripIdSchema,
    type BookingListInput,
    type DayInput,
    type FlightListInput,
    type InfoSectionListInput,
    type LodgingListInput,
    type MemberInviteInput,
    type MemberRoleInput,
    type ShareSettingsInput,
    type TripBasicsInput,
} from '@/entities/trip/trip.validate'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'
import { tripTemplateSchema, type TripTemplateInput } from '@/shared/lib/trip-template'

const REVALIDATE_PROFILE = 'max'

const expireTripLists = (userIds: string[]) => {
    for (const userId of userIds) updateTag(tripListTag(userId))
}

const expireShare = (slug: string | null) => {
    if (slug !== null) revalidateTag(tripShareTag(slug), REVALIDATE_PROFILE)
}

const expireTrip = async (tripId: string) => {
    updateTag(tripTag(tripId))
    const [userIds, slug] = await Promise.all([findTripMemberUserIds(tripId), findTripShareSlug(tripId)])
    expireTripLists(userIds)
    expireShare(slug)
}

export const createTripAction = async (input: TripBasicsInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const created = await createTrip(user.id, tripBasicsSchema.parse(input))
        updateTag(tripListTag(user.id))
        return created
    })
}

export const createTripFromTemplateAction = async (template: TripTemplateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const created = await createTripFromTemplate(user.id, tripTemplateSchema.parse(template))
        updateTag(tripListTag(user.id))
        return created
    })
}

export const updateTripBasicsAction = async (tripId: string, input: TripBasicsInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await updateTripBasics(id, tripBasicsSchema.parse(input))
        await expireTrip(id)
        return { id }
    })
}

export const saveFlightsAction = async (tripId: string, list: FlightListInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await saveFlights(id, flightListSchema.parse(list))
        await expireTrip(id)
        return { id }
    })
}

export const saveLodgingsAction = async (tripId: string, list: LodgingListInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await saveLodgings(id, lodgingListSchema.parse(list))
        await expireTrip(id)
        return { id }
    })
}

export const saveDayAction = async (tripId: string, day: DayInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        const saved = await saveDay(id, dayInputSchema.parse(day))
        await expireTrip(id)
        return saved
    })
}

export const deleteDayAction = async (tripId: string, dayId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        const targetDayId = tripIdSchema.parse(dayId)
        await assertTripAccess(id, user.id, 'edit')
        await deleteDay(id, targetDayId)
        await expireTrip(id)
        return { id: targetDayId }
    })
}

export const reorderDaysAction = async (tripId: string, dayIds: string[]) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await reorderDays(id, dayIdListSchema.parse(dayIds))
        await expireTrip(id)
        return { id }
    })
}

export const saveBookingsAction = async (tripId: string, list: BookingListInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await saveBookings(id, bookingListSchema.parse(list))
        await expireTrip(id)
        return { id }
    })
}

export const saveInfoSectionsAction = async (tripId: string, list: InfoSectionListInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await saveInfoSections(id, infoSectionListSchema.parse(list))
        await expireTrip(id)
        return { id }
    })
}

export const deleteTripAction = async (tripId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        const [userIds, slug] = await Promise.all([findTripMemberUserIds(id), findTripShareSlug(id)])
        await deleteTrip(id)
        updateTag(tripTag(id))
        expireTripLists(userIds)
        expireShare(slug)
        return { id }
    })
}

export const inviteMemberAction = async (tripId: string, input: MemberInviteInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        const invite = memberInviteSchema.parse(input)
        const result = await inviteMember(id, invite.email, invite.role, user.id)
        if (result.kind === 'member') updateTag(tripListTag(result.userId))
        return result
    })
}

export const updateMemberRoleAction = async (tripId: string, userId: string, role: MemberRoleInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        await updateMemberRole(id, userId, memberRoleSchema.parse(role))
        updateTag(tripListTag(userId))
        return { id }
    })
}

export const removeMemberAction = async (tripId: string, userId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        await removeMember(id, userId)
        updateTag(tripListTag(userId))
        return { id }
    })
}

export const removeInviteAction = async (tripId: string, inviteId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        await removeInvite(id, tripIdSchema.parse(inviteId))
        return { id }
    })
}

export const updateShareSettingsAction = async (tripId: string, input: ShareSettingsInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        const previousSlug = await findTripShareSlug(id)
        const settings = await updateShareSettings(id, shareSettingsSchema.parse(input))
        await expireTrip(id)
        if (previousSlug !== null && previousSlug !== settings.slug) expireShare(previousSlug)
        return settings
    })
}

export const exportTripAction = async (tripId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'view')
        return exportTripTemplate(id)
    })
}
