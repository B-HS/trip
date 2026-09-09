import 'server-only'
import { and, eq } from 'drizzle-orm'
import { canAcceptComment, canEditPost, canManageComment, canManagePost } from '@/entities/community/community.role'
import type { CommunityViewer } from '@/entities/community/community.type'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { getDb } from '@/shared/db/client'
import { tripBoard, tripComment, tripPost } from '@/shared/db/schema/community'
import { ApiError } from '@/shared/lib/api-response'

const POST_NOT_FOUND = '글을 찾을 수 없습니다.'
const COMMENT_NOT_FOUND = '댓글을 찾을 수 없습니다.'

const findPostWithBoard = async (postId: string) => {
    const [row] = await getDb()
        .select({ post: tripPost, board: { key: tripBoard.key, kind: tripBoard.kind } })
        .from(tripPost)
        .innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id))
        .where(eq(tripPost.id, postId))
        .limit(1)
    if (!row) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    return { ...row.post, boardKey: row.board.key, boardKind: row.board.kind }
}

export const assertPostEdit = async (postId: string, viewer: CommunityViewer) => {
    const post = await findPostWithBoard(postId)
    if (!canEditPost(viewer, post.authorId)) throw new ApiError('FORBIDDEN')
    return post
}

export const assertPostManage = async (postId: string, viewer: CommunityViewer) => {
    const post = await findPostWithBoard(postId)
    if (!canManagePost(viewer, post.authorId)) throw new ApiError('FORBIDDEN')
    return post
}

export const assertCommentManage = async (commentId: string, viewer: CommunityViewer) => {
    const [row] = await getDb().select().from(tripComment).where(eq(tripComment.id, commentId)).limit(1)
    if (!row) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
    if (!canManageComment(viewer, row.authorId)) throw new ApiError('FORBIDDEN')
    return row
}

export const assertCommentAccept = async (postId: string, commentId: string, viewer: CommunityViewer) => {
    const [row] = await getDb()
        .select({
            post: { authorId: tripPost.authorId },
            board: { kind: tripBoard.kind },
            comment: { authorId: tripComment.authorId, parentId: tripComment.parentId, isAccepted: tripComment.isAccepted },
        })
        .from(tripComment)
        .innerJoin(tripPost, eq(tripComment.postId, tripPost.id))
        .innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id))
        .where(and(eq(tripComment.id, commentId), eq(tripComment.postId, postId)))
        .limit(1)
    if (!row) throw new ApiError('NOT_FOUND', COMMENT_NOT_FOUND)
    if (!canAcceptComment(viewer, { authorId: row.post.authorId, boardKind: row.board.kind }, row.comment)) throw new ApiError('FORBIDDEN')
    return row.comment
}

export const assertTripAttachable = async (tripId: string, userId: string) => assertTripAccess(tripId, userId, 'view')
