'use client'

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    acceptCommentAction,
    createCommentAction,
    createPostAction,
    deleteCommentAction,
    deletePostAction,
    togglePostLikeAction,
    updatePostAction,
} from '@/entities/community/community.action'
import { fetchComments, fetchPostLike } from '@/entities/community/community.api'
import type { PostLikeState } from '@/entities/community/community.type'
import type { CommentCreateInput, PostCreateInput, PostUpdateInput } from '@/entities/community/community.validate'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { unwrapActionResult } from '@/shared/lib/action-result'

const MIN_LIKE_COUNT = 0
const LIKE_STEP = 1

export const commentsQueryOptions = (postId: string) =>
    queryOptions({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId), queryFn: () => fetchComments(postId) })

export const postLikeQueryOptions = (postId: string) =>
    queryOptions({ queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(postId), queryFn: () => fetchPostLike(postId) })

export const useComments = (postId: string) => useQuery({ ...commentsQueryOptions(postId), enabled: postId.length > 0 })

export const usePostLike = (postId: string) => useQuery({ ...postLikeQueryOptions(postId), enabled: postId.length > 0 })

export const useCreateComment = (postId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: CommentCreateInput) => unwrapActionResult(await createCommentAction(postId, input)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success('댓글을 남겼습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useDeleteComment = (postId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (commentId: string) => unwrapActionResult(await deleteCommentAction(commentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success('댓글을 삭제했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useAcceptComment = (postId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (commentId: string) => unwrapActionResult(await acceptCommentAction(postId, commentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
            toast.success('답변을 채택했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}

export const useTogglePostLike = (postId: string) => {
    const queryClient = useQueryClient()
    const queryKey = QUERY_KEY.COMMUNITY.POST_LIKE(postId)
    return useMutation({
        mutationFn: async (liked: boolean) => unwrapActionResult(await togglePostLikeAction(postId, liked)),
        onMutate: async (liked) => {
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData<PostLikeState>(queryKey)
            if (previous) {
                const step = liked ? LIKE_STEP : -LIKE_STEP
                const count = previous.liked === liked ? previous.count : Math.max(previous.count + step, MIN_LIKE_COUNT)
                queryClient.setQueryData<PostLikeState>(queryKey, { count, liked })
            }
            return { previous }
        },
        onError: (error, _liked, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
            toast.error(error.message)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
}

export const useCreatePost = () =>
    useMutation({
        mutationFn: async (input: PostCreateInput) => unwrapActionResult(await createPostAction(input)),
        onSuccess: () => toast.success('글을 등록했습니다.'),
        onError: (error) => toast.error(error.message),
    })

export const useUpdatePost = (postId: string) =>
    useMutation({
        mutationFn: async (input: PostUpdateInput) => unwrapActionResult(await updatePostAction(postId, input)),
        onSuccess: () => toast.success('글을 수정했습니다.'),
        onError: (error) => toast.error(error.message),
    })

export const useDeletePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (postId: string) => unwrapActionResult(await deletePostAction(postId)),
        onSuccess: (data) => {
            queryClient.removeQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(data.id) })
            queryClient.removeQueries({ queryKey: QUERY_KEY.COMMUNITY.POST_LIKE(data.id) })
            toast.success('글을 삭제했습니다.')
        },
        onError: (error) => toast.error(error.message),
    })
}
