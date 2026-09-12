'use client'

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
    createTripAction,
    createTripFromTemplateAction,
    deleteDayAction,
    deleteTripAction,
    exportTripAction,
    importTripAction,
    inviteMemberAction,
    removeInviteAction,
    removeMemberAction,
    reorderDaysAction,
    saveBookingsAction,
    saveDayAction,
    saveFlightsAction,
    saveInfoSectionsAction,
    saveLodgingsAction,
    saveScheduleKindsAction,
    saveSidebarAction,
    saveTripBasicsAction,
    toggleFavoriteAction,
    toggleTripLikeAction,
    updateMemberRoleAction,
    updateShareSettingsAction,
} from '@/entities/trip/trip.action'
import { fetchFavoriteTrips, fetchTripDetail, fetchTripLike, fetchTripList, fetchTripMembers } from '@/entities/trip/trip.api'
import { orderDaysByIds } from '@/entities/trip/trip.order'
import type { TripDetail, TripSummary } from '@/entities/trip/trip.type'
import type {
    BookingListInput,
    DayInput,
    FlightListInput,
    InfoSectionListInput,
    LodgingListInput,
    MemberInviteInput,
    MemberRoleInput,
    ScheduleKindsSaveInput,
    ShareSettingsInput,
    SidebarInput,
    TripBasicsFormInput,
    TripCreateInput,
} from '@/entities/trip/trip.validate'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { unwrapActionResult } from '@/shared/lib/action-result'
import { likeToggleMutationOptions } from '@/shared/lib/like-mutation'
import { translateMessage } from '@/shared/lib/message-key'
import type { TripTemplateInput } from '@/shared/lib/trip-template'
import { trackEvent } from '@/shared/lib/analytics'

export const tripListQueryOptions = () => queryOptions({ queryKey: QUERY_KEY.TRIP.LIST, queryFn: fetchTripList })

export const favoriteTripsQueryOptions = () => queryOptions({ queryKey: QUERY_KEY.TRIP.FAVORITES, queryFn: fetchFavoriteTrips })

export const tripDetailQueryOptions = (tripId: string) =>
    queryOptions({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId), queryFn: () => fetchTripDetail(tripId) })

export const tripMembersQueryOptions = (tripId: string) =>
    queryOptions({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId), queryFn: () => fetchTripMembers(tripId) })

export const tripLikeQueryOptions = (tripId: string) => queryOptions({ queryKey: QUERY_KEY.TRIP.LIKE(tripId), queryFn: () => fetchTripLike(tripId) })

export const useTripList = () => useQuery(tripListQueryOptions())

export const useFavoriteTrips = () => useQuery(favoriteTripsQueryOptions())

export const useTripDetail = (tripId: string) => useQuery({ ...tripDetailQueryOptions(tripId), enabled: tripId.length > 0 })

export const useTripMembers = (tripId: string) => useQuery({ ...tripMembersQueryOptions(tripId), enabled: tripId.length > 0 })

export const useTripLike = (tripId: string) => useQuery({ ...tripLikeQueryOptions(tripId), enabled: tripId.length > 0 })

export const useCreateTrip = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: TripCreateInput) => unwrapActionResult(await createTripAction(input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.tripCreated'))
            trackEvent('trip_created', { source: 'blank' })
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useCreateTripFromTemplate = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (template: TripTemplateInput) => unwrapActionResult(await createTripFromTemplateAction(template)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.sampleTripCreated'))
            trackEvent('trip_created_from_template')
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveTripBasics = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: TripBasicsFormInput) => unwrapActionResult(await saveTripBasicsAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.FAVORITES })
            toast.success(t('toasts.basicsSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useToggleFavorite = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (variables: { tripId: string; isFavorite: boolean }) =>
            unwrapActionResult(await toggleFavoriteAction(variables.tripId, variables.isFavorite)),
        onMutate: async ({ tripId, isFavorite }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            await queryClient.cancelQueries({ queryKey: QUERY_KEY.TRIP.FAVORITES })
            const previousList = queryClient.getQueryData<TripSummary[]>(QUERY_KEY.TRIP.LIST)
            const previousFavorites = queryClient.getQueryData<TripSummary[]>(QUERY_KEY.TRIP.FAVORITES)
            const nextList = previousList?.map((trip) => (trip.id === tripId ? { ...trip, isFavorite } : trip))
            if (nextList !== undefined) queryClient.setQueryData(QUERY_KEY.TRIP.LIST, nextList)
            if (previousFavorites !== undefined) {
                const target = nextList?.find((trip) => trip.id === tripId)
                const without = previousFavorites.filter((trip) => trip.id !== tripId)
                const next = isFavorite && target !== undefined ? [...without, target] : without
                queryClient.setQueryData(QUERY_KEY.TRIP.FAVORITES, next)
            }
            return { previousList, previousFavorites }
        },
        onError: (error, _variables, context) => {
            if (context?.previousList !== undefined) queryClient.setQueryData(QUERY_KEY.TRIP.LIST, context.previousList)
            if (context?.previousFavorites !== undefined) queryClient.setQueryData(QUERY_KEY.TRIP.FAVORITES, context.previousFavorites)
            toast.error(translateMessage(t, error.message))
        },
        onSuccess: (_result, variables) => {
            trackEvent('favorite_toggled', { isFavorite: variables.isFavorite })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.FAVORITES })
        },
    })
}

export const useSaveFlights = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: FlightListInput) => unwrapActionResult(await saveFlightsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.flightsSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveLodgings = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: LodgingListInput) => unwrapActionResult(await saveLodgingsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(t('toasts.lodgingsSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveSidebar = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: SidebarInput) => unwrapActionResult(await saveSidebarAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(t('toasts.sidebarSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveScheduleKinds = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: ScheduleKindsSaveInput) => unwrapActionResult(await saveScheduleKindsAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(t('toasts.scheduleKindsSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveDay = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (day: DayInput) => unwrapActionResult(await saveDayAction(tripId, day)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.daySaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useDeleteDay = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dayId: string) => unwrapActionResult(await deleteDayAction(tripId, dayId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.dayDeleted'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useReorderDays = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dayIds: string[]) => unwrapActionResult(await reorderDaysAction(tripId, dayIds)),
        onMutate: async (dayIds) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            const previousDetail = queryClient.getQueryData<TripDetail>(QUERY_KEY.TRIP.DETAIL(tripId))
            if (previousDetail !== undefined)
                queryClient.setQueryData(QUERY_KEY.TRIP.DETAIL(tripId), { ...previousDetail, days: orderDaysByIds(previousDetail.days, dayIds) })
            return { previousDetail }
        },
        onSuccess: () => toast.success(t('toasts.dayOrderSaved')),
        onError: (error, _dayIds, context) => {
            if (context?.previousDetail !== undefined) queryClient.setQueryData(QUERY_KEY.TRIP.DETAIL(tripId), context.previousDetail)
            toast.error(translateMessage(t, error.message))
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) }),
    })
}

export const useSaveBookings = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: BookingListInput) => unwrapActionResult(await saveBookingsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.bookingsSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSaveInfoSections = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: InfoSectionListInput) => unwrapActionResult(await saveInfoSectionsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(t('toasts.infoSaved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useDeleteTrip = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (tripId: string) => unwrapActionResult(await deleteTripAction(tripId)),
        onSuccess: (data) => {
            queryClient.removeQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(data.id) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.FAVORITES })
            toast.success(t('toasts.tripDeleted'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useInviteMember = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: MemberInviteInput) => unwrapActionResult(await inviteMemberAction(tripId, input)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success(data.kind === 'member' ? t('toasts.memberAdded') : t('toasts.inviteSent'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useUpdateMemberRole = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (variables: { userId: string; role: MemberRoleInput }) =>
            unwrapActionResult(await updateMemberRoleAction(tripId, variables.userId, variables.role)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success(t('toasts.roleUpdated'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useRemoveMember = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (userId: string) => unwrapActionResult(await removeMemberAction(tripId, userId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success(t('toasts.memberRemoved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useRemoveInvite = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (inviteId: string) => unwrapActionResult(await removeInviteAction(tripId, inviteId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success(t('toasts.inviteCanceled'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useUpdateShareSettings = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: ShareSettingsInput) => unwrapActionResult(await updateShareSettingsAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(t('toasts.saved'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useImportTrip = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (template: TripTemplateInput) => unwrapActionResult(await importTripAction(tripId, template)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.USER_STATE.TRIP(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success(t('toasts.tripImported'))
            trackEvent('trip_imported')
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useExportTrip = (tripId: string) => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async () => unwrapActionResult(await exportTripAction(tripId)),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useToggleTripLike = (tripId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation(
        likeToggleMutationOptions({
            queryClient,
            queryKey: QUERY_KEY.TRIP.LIKE(tripId),
            mutationFn: async (liked) => unwrapActionResult(await toggleTripLikeAction(tripId, liked)),
            formatError: (error) => translateMessage(t, error.message),
        }),
    )
}
