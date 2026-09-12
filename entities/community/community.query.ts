'use client'

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { translateMessage } from '@/shared/lib/message-key'
import {
    acceptCommentAction,
    banReportedUserAction,
    blockUserAction,
    createCommentAction,
    createPostAction,
    deleteCommentAction,
    deletePostAction,
    dismissReportAction,
    hideReportTargetAction,
    restorePostAction,
    submitReportAction,
    togglePostLikeAction,
    unbanUserAction,
    unblockUserAction,
    updatePostAction,
} from '@/entities/community/community.action'
import { fetchComments, fetchOpenReports, fetchPostLike } from '@/entities/community/community.api'
import type { CommentCreateInput, PostCreateInput, PostUpdateInput, ReportCreateInput } from '@/entities/community/community.validate'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { unwrapActionResult } from '@/shared/lib/action-result'
import { likeToggleMutationOptions } from '@/shared/lib/like-mutation'
import { trackEvent } from '@/shared/lib/analytics'

export const commentsQueryOptions = (postId: string) =>
    queryOptions({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId), queryFn: () => fetchComments(postId) })

export const postLikeQueryOptions = (postId: string) =>
    queryOptions({ queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(postId), queryFn: () => fetchPostLike(postId) })

export const openReportsQueryOptions = (page: number) =>
    queryOptions({ queryKey: QUERY_KEY.REPORT.LIST(page), queryFn: () => fetchOpenReports(page) })

export const useOpenReports = (page: number) => useQuery(openReportsQueryOptions(page))

export const useComments = (postId: string) => useQuery({ ...commentsQueryOptions(postId), enabled: postId.length > 0 })

export const usePostLike = (postId: string) => useQuery({ ...postLikeQueryOptions(postId), enabled: postId.length > 0 })

export const useCreateComment = (postId: string) => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: CommentCreateInput) => unwrapActionResult(await createCommentAction(postId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success(t('community.toast.commentCreated'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useDeleteComment = (postId: string) => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    return useMutation({
        mutationFn: async (commentId: string) => unwrapActionResult(await deleteCommentAction(commentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success(t('community.toast.commentDeleted'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useAcceptComment = (postId: string) => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    return useMutation({
        mutationFn: async (commentId: string) => unwrapActionResult(await acceptCommentAction(postId, commentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success(t('community.toast.accepted'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useTogglePostLike = (postId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation(
        likeToggleMutationOptions({
            queryClient,
            queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(postId),
            mutationFn: async (liked) => unwrapActionResult(await togglePostLikeAction(postId, liked)),
            formatError: (error) => translateMessage(t, error.message),
        }),
    )
}

export const useCreatePost = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: PostCreateInput) => unwrapActionResult(await createPostAction(input)),
        onSuccess: () => {
            toast.success(t('community.toast.postCreated'))
            trackEvent('post_created')
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useUpdatePost = (postId: string) => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: PostUpdateInput) => unwrapActionResult(await updatePostAction(postId, input)),
        onSuccess: () => toast.success(t('community.toast.postUpdated')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useSubmitReport = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: ReportCreateInput) => unwrapActionResult(await submitReportAction(input)),
        onSuccess: () => toast.success(t('community.toast.reportSubmitted')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useBlockUser = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (blockedId: string) => unwrapActionResult(await blockUserAction(blockedId)),
        onSuccess: () => toast.success(t('community.toast.blocked')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

const invalidateOpenReports = (queryClient: ReturnType<typeof useQueryClient>, page: number) =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY.REPORT.LIST(page) })

export const useHideReportTarget = (page: number) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (reportId: string) => unwrapActionResult(await hideReportTargetAction(reportId)),
        onSuccess: () => {
            invalidateOpenReports(queryClient, page)
            toast.success(t('community.toast.postHidden'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useDismissReport = (page: number) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (reportId: string) => unwrapActionResult(await dismissReportAction(reportId)),
        onSuccess: () => {
            invalidateOpenReports(queryClient, page)
            toast.success(t('community.toast.reportDismissed'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useBanReportedUser = (page: number) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (reportId: string) => unwrapActionResult(await banReportedUserAction(reportId)),
        onSuccess: () => {
            invalidateOpenReports(queryClient, page)
            toast.success(t('community.toast.blocked'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useUnbanUser = (page: number) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (userId: string) => unwrapActionResult(await unbanUserAction(userId)),
        onSuccess: () => {
            invalidateOpenReports(queryClient, page)
            toast.success(t('community.toast.unblocked'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useRestorePost = (page: number) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (postId: string) => unwrapActionResult(await restorePostAction(postId)),
        onSuccess: () => {
            invalidateOpenReports(queryClient, page)
            toast.success(t('community.toast.postRestored'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useUnblockUser = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (blockedId: string) => unwrapActionResult(await unblockUserAction(blockedId)),
        onSuccess: () => toast.success(t('community.toast.unblocked')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useDeletePost = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (postId: string) => unwrapActionResult(await deletePostAction(postId)),
        onSuccess: (data) => {
            queryClient.removeQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(data.id) })
            queryClient.removeQueries({ queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(data.id) })
            toast.success(t('community.toast.postDeleted'))
        },
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}
