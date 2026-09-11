import 'server-only'
import { and, asc, count, eq, isNull } from 'drizzle-orm'
import { projectComments, type CommentProjectionRow } from '@/entities/community/community.comment'
import { findBlockedIdsForUser } from '@/entities/community/community.repository.block'
import { buildAcceptanceLedger, buildRevocationLedger } from '@/entities/community/community.point'
import type { AcceptedCommentRef } from '@/entities/community/community.point'
import type { CommentView } from '@/entities/community/community.type'
import type { CommentCreateValues } from '@/entities/community/community.validate'
import type { TripTransaction } from '@/entities/trip/trip.type'
import { POINT_ANSWER, QNA_BOARD_KIND, type PointReason } from '@/shared/constant/community'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripBoard, tripComment, tripPointLedger, tripPost } from '@/shared/db/schema/community'
import { ApiError } from '@/shared/lib/api-response'

const POST_NOT_FOUND = 'error.postNotFound'
const COMMENT_NOT_FOUND = 'error.commentNotFound'
const PARENT_NOT_FOUND = 'error.parentCommentNotFound'
const ALREADY_ACCEPTED = 'error.alreadyAccepted'

const lockPost = async (tx: TripTransaction, postId: string) => {
    const [row] = await tx
        .select({ authorId: tripPost.authorId, boardId: tripPost.boardId, acceptedCommentId: tripPost.acceptedCommentId })
        .from(tripPost)
        .where(and(eq(tripPost.id, postId), isNull(tripPost.deletedAt)))
        .limit(1)
        .for('update')
    if (!row) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    return row
}

const findAcceptedCommentRef = async (tx: TripTransaction, commentId: string): Promise<AcceptedCommentRef | null> => {
    const [row] = await tx
        .select({ id: tripComment.id, authorId: tripComment.authorId })
        .from(tripComment)
        .where(eq(tripComment.id, commentId))
        .limit(1)
    if (!row) return null
    return { commentId: row.id, authorId: row.authorId }
}

const isQnaBoard = async (tx: TripTransaction, boardId: string) => {
    const [row] = await tx.select({ kind: tripBoard.kind }).from(tripBoard).where(eq(tripBoard.id, boardId)).limit(1)
    return row?.kind === QNA_BOARD_KIND
}

const syncCommentCount = async (tx: TripTransaction, postId: string) => {
    const [row] = await tx
        .select({ value: count() })
        .from(tripComment)
        .where(and(eq(tripComment.postId, postId), isNull(tripComment.deletedAt)))
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

export const findComments = async (postId: string, viewerId: string | null = null): Promise<CommentView[]> => {
    const rows = await getDb()
        .select({
            comment: {
                id: tripComment.id,
                postId: tripComment.postId,
                parentId: tripComment.parentId,
                body: tripComment.body,
                isAccepted: tripComment.isAccepted,
                deletedAt: tripComment.deletedAt,
                createdAt: tripComment.createdAt,
            },
            author: { id: user.id, name: user.name, username: user.username, image: user.image },
        })
        .from(tripComment)
        .innerJoin(user, eq(tripComment.authorId, user.id))
        .where(eq(tripComment.postId, postId))
        .orderBy(asc(tripComment.createdAt))
    const projectionRows: CommentProjectionRow[] = rows.map((row) => ({
        id: row.comment.id,
        postId: row.comment.postId,
        parentId: row.comment.parentId,
        author: row.author,
        body: row.comment.body,
        isAccepted: row.comment.isAccepted,
        deletedAt: row.comment.deletedAt,
        createdAt: row.comment.createdAt,
    }))
    const blockedIds = viewerId === null ? new Set<string>() : new Set(await findBlockedIdsForUser(viewerId))
    return projectComments(projectionRows, blockedIds) satisfies CommentView[]
}

export const createComment = async (postId: string, authorId: string, values: CommentCreateValues) => {
    const id = crypto.randomUUID()
    await getDb().transaction(async (tx) => {
        const post = await lockPost(tx, postId)
        if (values.parentId !== null) {
            const [parent] = await tx
                .select({ id: tripComment.id })
                .from(tripComment)
                .where(and(eq(tripComment.id, values.parentId), eq(tripComment.postId, postId), isNull(tripComment.deletedAt)))
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
        if (post.acceptedCommentId === commentId) return
        const [target] = await tx
            .select({ authorId: tripComment.authorId, isAccepted: tripComment.isAccepted })
            .from(tripComment)
            .where(and(eq(tripComment.id, commentId), eq(tripComment.postId, postId), isNull(tripComment.deletedAt)))
            .limit(1)
        if (!target) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
        if (target.isAccepted) throw new ApiError('VALIDATION_ERROR', ALREADY_ACCEPTED)
        const previousAccepted = post.acceptedCommentId === null ? null : await findAcceptedCommentRef(tx, post.acceptedCommentId)
        for (const entry of buildAcceptanceLedger({ previousAccepted, nextAccepted: { commentId, authorId: target.authorId } })) {
            await insertPoint(tx, entry)
        }
        if (post.acceptedCommentId !== null) await tx.update(tripComment).set({ isAccepted: false }).where(eq(tripComment.id, post.acceptedCommentId))
        await tx.update(tripComment).set({ isAccepted: true }).where(eq(tripComment.id, commentId))
        await tx.update(tripPost).set({ acceptedCommentId: commentId }).where(eq(tripPost.id, postId))
    })
    return { id: commentId }
}

export const findPostIdByCommentId = async (commentId: string) => {
    const [row] = await getDb().select({ postId: tripComment.postId }).from(tripComment).where(eq(tripComment.id, commentId)).limit(1)
    if (!row) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
    return row.postId
}

export const deleteComment = async (commentId: string) => {
    const postId = await getDb().transaction(async (tx) => {
        const [target] = await tx
            .select({ postId: tripComment.postId, authorId: tripComment.authorId })
            .from(tripComment)
            .where(and(eq(tripComment.id, commentId), isNull(tripComment.deletedAt)))
            .limit(1)
        if (!target) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
        const post = await lockPost(tx, target.postId)
        await tx.update(tripComment).set({ deletedAt: new Date(), isAccepted: false }).where(eq(tripComment.id, commentId))
        if (post.acceptedCommentId === commentId) {
            for (const entry of buildRevocationLedger({ commentId, authorId: target.authorId })) {
                await insertPoint(tx, entry)
            }
            await tx.update(tripPost).set({ acceptedCommentId: null }).where(eq(tripPost.id, target.postId))
        }
        await syncCommentCount(tx, target.postId)
        return target.postId
    })
    return { id: commentId, postId }
}
