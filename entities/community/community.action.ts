'use server'

import { revalidatePath } from 'next/cache'
import {
    assertCommentAccept,
    assertCommentManage,
    assertPostEdit,
    assertPostManage,
    assertTripAttachable,
} from '@/entities/community/community.access'
import { createPost, deletePost, updatePost } from '@/entities/community/community.repository'
import { acceptComment, createComment, deleteComment } from '@/entities/community/community.repository.comments'
import { setPostLike } from '@/entities/community/community.repository.likes'
import {
    commentCreateSchema,
    commentIdSchema,
    likeFlagSchema,
    postCreateSchema,
    postIdSchema,
    postUpdateSchema,
    type CommentCreateInput,
    type PostCreateInput,
    type PostUpdateInput,
} from '@/entities/community/community.validate'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'

const revalidateBoard = (boardKey: string) => revalidatePath(`/boards/${boardKey}`)

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
        return { id: deleted.id }
    })
}

export const acceptCommentAction = async (postId: string, commentId: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const targetPostId = postIdSchema.parse(postId)
        const id = commentIdSchema.parse(commentId)
        await assertCommentAccept(targetPostId, id, user)
        return acceptComment(targetPostId, id)
    })
}
