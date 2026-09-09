import 'server-only'
import { and, asc, count, eq } from 'drizzle-orm'
import type { CommentView } from '@/entities/community/community.type'
import type { CommentCreateValues } from '@/entities/community/community.validate'
import type { TripTransaction } from '@/entities/trip/trip.type'
import { POINT_ACCEPTED, POINT_ANSWER, QNA_BOARD_KIND, type PointReason } from '@/shared/constant/community'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripBoard, tripComment, tripPointLedger, tripPost } from '@/shared/db/schema/community'
import { ApiError } from '@/shared/lib/api-response'

const POST_NOT_FOUND = '글을 찾을 수 없습니다.'
const COMMENT_NOT_FOUND = '댓글을 찾을 수 없습니다.'
const PARENT_NOT_FOUND = '답글을 달 댓글을 찾을 수 없습니다.'
const ALREADY_ACCEPTED = '이미 채택한 댓글이 있습니다.'

const lockPost = async (tx: TripTransaction, postId: string) => {
    const [row] = await tx
        .select({ authorId: tripPost.authorId, boardId: tripPost.boardId, acceptedCommentId: tripPost.acceptedCommentId })
        .from(tripPost)
        .where(eq(tripPost.id, postId))
        .limit(1)
        .for('update')
    if (!row) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    return row
}

const isQnaBoard = async (tx: TripTransaction, boardId: string) => {
    const [row] = await tx.select({ kind: tripBoard.kind }).from(tripBoard).where(eq(tripBoard.id, boardId)).limit(1)
    return row?.kind === QNA_BOARD_KIND
}

const syncCommentCount = async (tx: TripTransaction, postId: string) => {
    const [row] = await tx.select({ value: count() }).from(tripComment).where(eq(tripComment.postId, postId))
    await tx
        .update(tripPost)
        .set({ commentCount: row?.value ?? 0 })
        .where(eq(tripPost.id, postId))
}

const insertPoint = async (tx: TripTransaction, values: { userId: string; delta: number; reason: PointReason; refId: string }) => {
    await tx
        .insert(tripPointLedger)
        .values(values)
        .onDuplicateKeyUpdate({ set: { refId: values.refId } })
}

export const findComments = async (postId: string) => {
    const rows = await getDb()
        .select({
            comment: {
                id: tripComment.id,
                postId: tripComment.postId,
                parentId: tripComment.parentId,
                body: tripComment.body,
                isAccepted: tripComment.isAccepted,
                createdAt: tripComment.createdAt,
            },
            author: { id: user.id, name: user.name, username: user.username, image: user.image },
        })
        .from(tripComment)
        .innerJoin(user, eq(tripComment.authorId, user.id))
        .where(eq(tripComment.postId, postId))
        .orderBy(asc(tripComment.createdAt))
    return rows.map(
        (row) =>
            ({
                id: row.comment.id,
                postId: row.comment.postId,
                parentId: row.comment.parentId,
                author: row.author,
                body: row.comment.body,
                isAccepted: row.comment.isAccepted,
                createdAt: row.comment.createdAt.toISOString(),
            }) satisfies CommentView,
    )
}

export const createComment = async (postId: string, authorId: string, values: CommentCreateValues) => {
    const id = crypto.randomUUID()
    await getDb().transaction(async (tx) => {
        const post = await lockPost(tx, postId)
        if (values.parentId !== null) {
            const [parent] = await tx
                .select({ id: tripComment.id })
                .from(tripComment)
                .where(and(eq(tripComment.id, values.parentId), eq(tripComment.postId, postId)))
                .limit(1)
            if (!parent) throw new ApiError('NOT_FOUND', PARENT_NOT_FOUND)
        }
        await tx.insert(tripComment).values({ id, postId, authorId, parentId: values.parentId, body: values.body })
        await syncCommentCount(tx, postId)
        if (post.authorId !== authorId && values.parentId === null && (await isQnaBoard(tx, post.boardId)))
            await insertPoint(tx, { userId: authorId, delta: POINT_ANSWER, reason: 'answer', refId: postId })
    })
    return { id }
}

export const acceptComment = async (postId: string, commentId: string) => {
    await getDb().transaction(async (tx) => {
        const post = await lockPost(tx, postId)
        if (post.acceptedCommentId !== null) throw new ApiError('VALIDATION_ERROR', ALREADY_ACCEPTED)
        const [target] = await tx
            .select({ authorId: tripComment.authorId })
            .from(tripComment)
            .where(and(eq(tripComment.id, commentId), eq(tripComment.postId, postId)))
            .limit(1)
        if (!target) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
        await tx.update(tripComment).set({ isAccepted: true }).where(eq(tripComment.id, commentId))
        await tx.update(tripPost).set({ acceptedCommentId: commentId }).where(eq(tripPost.id, postId))
        await insertPoint(tx, { userId: target.authorId, delta: POINT_ACCEPTED, reason: 'accepted', refId: commentId })
    })
    return { id: commentId }
}

export const deleteComment = async (commentId: string) => {
    const postId = await getDb().transaction(async (tx) => {
        const [target] = await tx.select({ postId: tripComment.postId }).from(tripComment).where(eq(tripComment.id, commentId)).limit(1)
        if (!target) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
        await lockPost(tx, target.postId)
        await tx.delete(tripComment).where(eq(tripComment.id, commentId))
        await syncCommentCount(tx, target.postId)
        return target.postId
    })
    return { id: commentId, postId }
}
