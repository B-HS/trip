import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { getTripRole } from '@/entities/trip/trip.access'
import { getFavoriteTrips, getTripDetail, getTripList } from '@/entities/trip/trip.cache'
import { findTripInvites, findTripMembers } from '@/entities/trip/trip.repository.members'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { ApiError } from '@/shared/lib/api-response'

export const prefetchTripList = async (queryClient: QueryClient, userId: string) =>
    queryClient.prefetchQuery({ queryKey: QUERY_KEY.TRIP.LIST, queryFn: () => getTripList(userId) })

export const prefetchFavoriteTrips = async (queryClient: QueryClient, userId: string) =>
    queryClient.prefetchQuery({ queryKey: QUERY_KEY.TRIP.FAVORITES, queryFn: () => getFavoriteTrips(userId) })

export const prefetchTripDetail = async (queryClient: QueryClient, tripId: string, userId: string) =>
    queryClient.prefetchQuery({
        queryKey: QUERY_KEY.TRIP.DETAIL(tripId),
        queryFn: async () => {
            const [detail, viewerRole] = await Promise.all([getTripDetail(tripId), getTripRole(tripId, userId)])
            if (detail === null) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
            return { ...detail, viewerRole }
        },
    })

export const prefetchTripMembers = async (queryClient: QueryClient, tripId: string) =>
    queryClient.prefetchQuery({
        queryKey: QUERY_KEY.TRIP.MEMBERS(tripId),
        queryFn: async () => {
            const [members, invites] = await Promise.all([findTripMembers(tripId), findTripInvites(tripId)])
            return { members, invites }
        },
    })
