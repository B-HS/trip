'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { assertTripAccess } from '@/entities/trip/trip.access'
import {
    createTrip,
    createTripFromTemplate,
    deleteTrip,
    exportTripTemplate,
    findTripShareSlug,
    replaceTripFromTemplate,
    saveBookings,
    saveFlights,
    saveInfoSections,
    saveLodgings,
    saveSidebar,
    saveTripBasics,
    updateShareSettings,
} from '@/entities/trip/trip.repository'
import { deleteDay, reorderDays, saveDay } from '@/entities/trip/trip.repository.days'
import { setTripFavorite } from '@/entities/trip/trip.repository.favorites'
import { inviteMember, removeInvite, removeMember, updateMemberRole } from '@/entities/trip/trip.repository.members'
import { tripShareTag } from '@/entities/trip/trip.tag'
import {
    bookingListSchema,
    dayIdListSchema,
    dayInputSchema,
    favoriteFlagSchema,
    flightListSchema,
    infoSectionListSchema,
    lodgingListSchema,
    memberInviteSchema,
    memberRoleSchema,
    shareSettingsSchema,
    sidebarSchema,
    tripBasicsFormSchema,
    tripCreateSchema,
    tripIdSchema,
    type BookingListInput,
    type DayInput,
    type FlightListInput,
    type InfoSectionListInput,
    type LodgingListInput,
    type MemberInviteInput,
    type MemberRoleInput,
    type ShareSettingsInput,
    type SidebarInput,
    type TripBasicsFormInput,
    type TripCreateInput,
} from '@/entities/trip/trip.validate'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'
import { tripTemplateSchema, type TripTemplateInput } from '@/shared/lib/trip-template'

const expireShare = (slug: string | null) => {
    if (slug === null) return
    updateTag(tripShareTag(slug))
    revalidatePath(`/s/${slug}`)
}

const expireTrip = async (tripId: string) => {
    expireShare(await findTripShareSlug(tripId))
}

export const createTripAction = async (input: TripCreateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const { destinations, ...basics } = tripCreateSchema.parse(input)
        return createTrip(user.id, basics, destinations)
    })
}

export const createTripFromTemplateAction = async (template: TripTemplateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const created = await createTripFromTemplate(user.id, tripTemplateSchema.parse(template))
        return created
    })
}

export const saveTripBasicsAction = async (tripId: string, input: TripBasicsFormInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        const { destinations, ...basics } = tripBasicsFormSchema.parse(input)
        await saveTripBasics(id, basics, destinations)
        await expireTrip(id)
        return { id }
    })
}

export const toggleFavoriteAction = async (tripId: string, isFavorite: boolean) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'view')
        const flag = favoriteFlagSchema.parse(isFavorite)
        await setTripFavorite(user.id, id, flag)
        return { id, isFavorite: flag }
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

export const saveSidebarAction = async (tripId: string, input: SidebarInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await saveSidebar(id, sidebarSchema.parse(input))
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
        const slug = await findTripShareSlug(id)
        await deleteTrip(id)
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
        return result
    })
}

export const updateMemberRoleAction = async (tripId: string, userId: string, role: MemberRoleInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        await updateMemberRole(id, userId, memberRoleSchema.parse(role))
        return { id }
    })
}

export const removeMemberAction = async (tripId: string, userId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'own')
        await removeMember(id, userId)
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

export const importTripAction = async (tripId: string, input: TripTemplateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = tripIdSchema.parse(tripId)
        await assertTripAccess(id, user.id, 'edit')
        await replaceTripFromTemplate(id, tripTemplateSchema.parse(input))
        await expireTrip(id)
        return { id }
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
