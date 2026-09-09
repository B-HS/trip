'use client'

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    createTripAction,
    createTripFromTemplateAction,
    deleteDayAction,
    deleteTripAction,
    exportTripAction,
    inviteMemberAction,
    removeInviteAction,
    removeMemberAction,
    reorderDaysAction,
    saveBookingsAction,
    saveDayAction,
    saveFlightsAction,
    saveInfoSectionsAction,
    saveLodgingsAction,
    updateMemberRoleAction,
    updateShareSettingsAction,
    updateTripBasicsAction,
} from '@/entities/trip/trip.action'
import { fetchTripDetail, fetchTripList, fetchTripMembers } from '@/entities/trip/trip.api'
import type {
    BookingListInput,
    DayInput,
    FlightListInput,
    InfoSectionListInput,
    LodgingListInput,
    MemberInviteInput,
    MemberRoleInput,
    ShareSettingsInput,
    TripBasicsInput,
} from '@/entities/trip/trip.validate'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { unwrapActionResult } from '@/shared/lib/action-result'
import type { TripTemplateInput } from '@/shared/lib/trip-template'

const SAVED_MESSAGE = '저장했습니다.'

export const tripListQueryOptions = () => queryOptions({ queryKey: QUERY_KEY.TRIP.LIST, queryFn: fetchTripList })

export const tripDetailQueryOptions = (tripId: string) =>
    queryOptions({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId), queryFn: () => fetchTripDetail(tripId) })

export const tripMembersQueryOptions = (tripId: string) =>
    queryOptions({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId), queryFn: () => fetchTripMembers(tripId) })

export const useTripList = () => useQuery(tripListQueryOptions())

export const useTripDetail = (tripId: string) => useQuery({ ...tripDetailQueryOptions(tripId), enabled: tripId.length > 0 })

export const useTripMembers = (tripId: string) => useQuery({ ...tripMembersQueryOptions(tripId), enabled: tripId.length > 0 })

export const useCreateTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: TripBasicsInput) => unwrapActionResult(await createTripAction(input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('여행을 만들었습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useCreateTripFromTemplate = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (template: TripTemplateInput) => unwrapActionResult(await createTripFromTemplateAction(template)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('예시 여행을 만들었습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useUpdateTripBasics = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: TripBasicsInput) => unwrapActionResult(await updateTripBasicsAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('기본 정보를 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useSaveFlights = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: FlightListInput) => unwrapActionResult(await saveFlightsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('항공편을 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useSaveLodgings = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: LodgingListInput) => unwrapActionResult(await saveLodgingsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success('숙소를 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useSaveDay = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (day: DayInput) => unwrapActionResult(await saveDayAction(tripId, day)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('일정을 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useDeleteDay = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dayId: string) => unwrapActionResult(await deleteDayAction(tripId, dayId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('날짜를 삭제했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useReorderDays = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (dayIds: string[]) => unwrapActionResult(await reorderDaysAction(tripId, dayIds)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success('날짜 순서를 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useSaveBookings = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: BookingListInput) => unwrapActionResult(await saveBookingsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('예매 목록을 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useSaveInfoSections = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (list: InfoSectionListInput) => unwrapActionResult(await saveInfoSectionsAction(tripId, list)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success('여행 정보를 저장했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useDeleteTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (tripId: string) => unwrapActionResult(await deleteTripAction(tripId)),
        onSuccess: (data) => {
            queryClient.removeQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(data.id) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.LIST })
            toast.success('여행을 삭제했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useInviteMember = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: MemberInviteInput) => unwrapActionResult(await inviteMemberAction(tripId, input)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success(data.kind === 'member' ? '멤버를 추가했습니다.' : '초대를 보냈습니다. 가입하면 자동으로 참여합니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useUpdateMemberRole = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (variables: { userId: string; role: MemberRoleInput }) =>
            unwrapActionResult(await updateMemberRoleAction(tripId, variables.userId, variables.role)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success('권한을 변경했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useRemoveMember = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (userId: string) => unwrapActionResult(await removeMemberAction(tripId, userId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success('멤버를 삭제했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useRemoveInvite = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (inviteId: string) => unwrapActionResult(await removeInviteAction(tripId, inviteId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.MEMBERS(tripId) })
            toast.success('초대를 취소했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useUpdateShareSettings = (tripId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: ShareSettingsInput) => unwrapActionResult(await updateShareSettingsAction(tripId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.TRIP.DETAIL(tripId) })
            toast.success(SAVED_MESSAGE)
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useExportTrip = (tripId: string) =>
    useMutation({
        mutationFn: async () => unwrapActionResult(await exportTripAction(tripId)),
        onError: (error) => toast.error(error.message),
    })
