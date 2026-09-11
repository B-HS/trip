'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import {
    assertAdmin,
    assertCommentAccept,
    assertCommentManage,
    assertPostEdit,
    assertPostManage,
    assertTripAttachable,
} from '@/entities/community/community.access'
import { blockUser, unblockUser } from '@/entities/community/community.repository.block'
import { createPost, deletePost, findBoardKeyByPostId, restorePost, updatePost } from '@/entities/community/community.repository'
import { acceptComment, createComment, deleteComment, findPostIdByCommentId } from '@/entities/community/community.repository.comments'
import { setPostLike } from '@/entities/community/community.repository.likes'
import {
    findReportById,
    markReportHandled,
    resolveReportTargetUserId,
    softDeleteTarget,
    submitReport,
} from '@/entities/community/community.repository.report'
import {
    commentCreateSchema,
    commentIdSchema,
    likeFlagSchema,
    postCreateSchema,
    postIdSchema,
    postUpdateSchema,
    reportCreateSchema,
    type CommentCreateInput,
    type PostCreateInput,
    type PostUpdateInput,
    type ReportCreateInput,
} from '@/entities/community/community.validate'
import { getAuth } from '@/shared/lib/auth'
import { ApiError } from '@/shared/lib/api-response'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'

const revalidateBoard = (boardKey: string) => revalidatePath(`/boards/${boardKey}`)

const revalidatePost = async (postId: string) => {
    const boardKey = await findBoardKeyByPostId(postId)
    if (boardKey !== null) revalidatePath(`/boards/${boardKey}/${postId}`)
}

export const createPostAction = async (input: PostCreateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const values = postCreateSchema.parse(input)
        if (values.tripId !== null) await assertTripAttachable(values.tripId, user.id)
        const created = await createPost(user.id, values)
        revalidateBoard(values.boardKey)
        return { id: created.id, boardKey: values.boardKey }
    })
}

export const updatePostAction = async (postId: string, input: PostUpdateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(postId)
        const post = await assertPostEdit(id, user)
        const values = postUpdateSchema.parse(input)
        if (values.tripId !== null) await assertTripAttachable(values.tripId, user.id)
        await updatePost(id, values)
        revalidateBoard(post.boardKey)
        revalidatePath(`/boards/${post.boardKey}/${id}`)
        return { id, boardKey: post.boardKey }
    })
}

export const deletePostAction = async (postId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(postId)
        const post = await assertPostManage(id, user)
        await deletePost(id)
        revalidateBoard(post.boardKey)
        return { id, boardKey: post.boardKey }
    })
}

export const togglePostLikeAction = async (postId: string, liked: boolean) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(postId)
        return setPostLike(id, user.id, likeFlagSchema.parse(liked))
    })
}

export const createCommentAction = async (postId: string, input: CommentCreateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(postId)
        return createComment(id, user.id, commentCreateSchema.parse(input))
    })
}

export const deleteCommentAction = async (commentId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = commentIdSchema.parse(commentId)
        await assertCommentManage(id, user)
        const deleted = await deleteComment(id)
        await revalidatePost(deleted.postId)
        return { id: deleted.id, postId: deleted.postId }
    })
}

export const acceptCommentAction = async (postId: string, commentId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const targetPostId = postIdSchema.parse(postId)
        const id = commentIdSchema.parse(commentId)
        await assertCommentAccept(targetPostId, id, user)
        const accepted = await acceptComment(targetPostId, id)
        await revalidatePost(targetPostId)
        return accepted
    })
}

export const restorePostAction = async (postId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        assertAdmin(user)
        const id = postIdSchema.parse(postId)
        await restorePost(id)
        await revalidatePost(id)
        return { id }
    })
}

export const submitReportAction = async (input: ReportCreateInput) => {
    const user = await requireUser()
    return runAction(async () => submitReport(user.id, reportCreateSchema.parse(input)))
}

export const hideReportTargetAction = async (reportId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        assertAdmin(user)
        const id = postIdSchema.parse(reportId)
        const report = await findReportById(id)
        if (report.kind === 'user') throw new ApiError('VALIDATION_ERROR', 'error.cannotHideUserReport')
        await softDeleteTarget(report.kind, report.targetId)
        await markReportHandled(id, user.id, 'hidden')
        await revalidatePost(report.kind === 'post' ? report.targetId : await findPostIdByCommentId(report.targetId))
        return { id, status: 'hidden' as const }
    })
}

export const dismissReportAction = async (reportId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        assertAdmin(user)
        const id = postIdSchema.parse(reportId)
        await findReportById(id)
        await markReportHandled(id, user.id, 'dismissed')
        return { id, status: 'dismissed' as const }
    })
}

export const banReportedUserAction = async (reportId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        assertAdmin(user)
        const id = postIdSchema.parse(reportId)
        const report = await findReportById(id)
        const userId = await resolveReportTargetUserId(report)
        await getAuth().api.banUser({ body: { userId, banReason: report.reason }, headers: await headers() })
        await markReportHandled(id, user.id, 'banned')
        return { id, userId, status: 'banned' as const }
    })
}

export const unbanUserAction = async (userId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        assertAdmin(user)
        const id = postIdSchema.parse(userId)
        await getAuth().api.unbanUser({ body: { userId: id }, headers: await headers() })
        return { userId: id }
    })
}

export const blockUserAction = async (blockedId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(blockedId)
        if (id === user.id) throw new ApiError('VALIDATION_ERROR', 'error.cannotBlockSelf')
        return blockUser(user.id, id)
    })
}

export const unblockUserAction = async (blockedId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const id = postIdSchema.parse(blockedId)
        return unblockUser(user.id, id)
    })
}
