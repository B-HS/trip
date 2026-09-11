import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { findComments } from '@/entities/community/community.repository.comments'
import { findPostLikeState } from '@/entities/community/community.repository.likes'
import { findOpenReportsPage } from '@/entities/community/community.repository.report'
import { PAGE_SIZE } from '@/shared/constant/community'
import { QUERY_KEY } from '@/shared/constant/query-key'

export const prefetchComments = async (queryClient: QueryClient, postId: string, viewerId: string | null = null) =>
    queryClient.prefetchQuery({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId), queryFn: () => findComments(postId, viewerId) })

export const prefetchPostLike = async (queryClient: QueryClient, postId: string, userId: string | null) =>
    queryClient.prefetchQuery({ queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(postId), queryFn: () => findPostLikeState(postId, userId) })

export const prefetchOpenReports = async (queryClient: QueryClient, page: number) =>
    queryClient.prefetchQuery({
        queryKey: QUERY_KEY.REPORT.LIST(page),
        queryFn: () => findOpenReportsPage((page - 1) * PAGE_SIZE, PAGE_SIZE),
    })
