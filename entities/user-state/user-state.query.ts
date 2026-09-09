'use client'

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resetDayChecksAction, saveDayMemoAction, toggleBookingCheckAction, toggleScheduleCheckAction } from '@/entities/user-state/user-state.action'
import { fetchTripUserState } from '@/entities/user-state/user-state.api'
import type { TripUserState } from '@/entities/user-state/user-state.type'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { unwrapActionResult } from '@/shared/lib/action-result'

const toggleId = (ids: string[], id: string, checked: boolean) => (checked ? Array.from(new Set([...ids, id])) : ids.filter((value) => value !== id))

export const userStateQueryOptions = (tripId: string) =>
    queryOptions({ queryKey: QUERY_KEY.USER_STATE.TRIP(tripId), queryFn: () => fetchTripUserState(tripId) })

export const useTripUserState = (tripId: string) => useQuery({ ...userStateQueryOptions(tripId), enabled: tripId.length > 0 })

export const useToggleScheduleCheck = (tripId: string) => {
    const queryClient = useQueryClient()
    const queryKey = QUERY_KEY.USER_STATE.TRIP(tripId)
    return useMutation({
        mutationFn: async (variables: { itemId: string; checked: boolean }) =>
            unwrapActionResult(await toggleScheduleCheckAction(tripId, variables.itemId, variables.checked)),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<TripUserState>(queryKey)
            if (previous)
                queryClient.setQueryData<TripUserState>(queryKey, {
                    ...previous,
                    scheduleCheckedIds: toggleId(previous.scheduleCheckedIds, variables.itemId, variables.checked),
                })
            return { previous }
        },
        onError: (error, variables, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
            toast.error(error.message)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
}

export const useToggleBookingCheck = (tripId: string) => {
    const queryClient = useQueryClient()
    const queryKey = QUERY_KEY.USER_STATE.TRIP(tripId)
    return useMutation({
        mutationFn: async (variables: { bookingId: string; checked: boolean }) =>
            unwrapActionResult(await toggleBookingCheckAction(tripId, variables.bookingId, variables.checked)),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<TripUserState>(queryKey)
            if (previous)
                queryClient.setQueryData<TripUserState>(queryKey, {
                    ...previous,
                    bookingCheckedIds: toggleId(previous.bookingCheckedIds, variables.bookingId, variables.checked),
                })
            return { previous }
        },
        onError: (error, variables, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
            toast.error(error.message)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
}

export const useResetDayChecks = (tripId: string) => {
    const queryClient = useQueryClient()
    const queryKey = QUERY_KEY.USER_STATE.TRIP(tripId)
    return useMutation({
        mutationFn: async (variables: { dayId: string; scheduleItemIds: string[] }) =>
            unwrapActionResult(await resetDayChecksAction(tripId, variables.dayId)),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<TripUserState>(queryKey)
            if (previous) {
                const cleared = new Set(variables.scheduleItemIds)
                queryClient.setQueryData<TripUserState>(queryKey, {
                    ...previous,
                    scheduleCheckedIds: previous.scheduleCheckedIds.filter((id) => !cleared.has(id)),
                })
            }
            return { previous }
        },
        onError: (error, variables, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
            toast.error(error.message)
        },
        onSuccess: () => toast.success('이 날의 체크를 모두 해제했습니다.'),
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
}

export const useSaveDayMemo = (tripId: string) => {
    const queryClient = useQueryClient()
    const queryKey = QUERY_KEY.USER_STATE.TRIP(tripId)
    return useMutation({
        mutationFn: async (variables: { dayId: string; content: string }) =>
            unwrapActionResult(await saveDayMemoAction(tripId, variables.dayId, variables.content)),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<TripUserState>(queryKey)
            if (previous)
                queryClient.setQueryData<TripUserState>(queryKey, { ...previous, memos: { ...previous.memos, [variables.dayId]: variables.content } })
            return { previous }
        },
        onError: (error, variables, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
            toast.error(error.message)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
}
