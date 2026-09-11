import 'server-only'
import { and, count, eq } from 'drizzle-orm'
import type { PostLikeState } from '@/entities/community/community.type'
import { getDb } from '@/shared/db/client'
import { tripPost, tripPostLike } from '@/shared/db/schema/community'
import { ApiError } from '@/shared/lib/api-response'

const POST_NOT_FOUND = 'error.postNotFound'

export const findPostLikeState = async (postId: string, userId: string | null) => {
    const [post] = await getDb().select({ likeCount: tripPost.likeCount }).from(tripPost).where(eq(tripPost.id, postId)).limit(1)
    if (!post) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    if (userId === null) return { count: post.likeCount, liked: false } satisfies PostLikeState
    const [liked] = await getDb()
        .select({ userId: tripPostLike.userId })
        .from(tripPostLike)
        .where(and(eq(tripPostLike.postId, postId), eq(tripPostLike.userId, userId)))
        .limit(1)
    return { count: post.likeCount, liked: liked !== undefined } satisfies PostLikeState
}

export const setPostLike = async (postId: string, userId: string, liked: boolean) => {
    const likeCount = await getDb().transaction(async (tx) => {
        const [post] = await tx.select({ id: tripPost.id }).from(tripPost).where(eq(tripPost.id, postId)).limit(1).for('update')
        if (!post) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
        if (liked) await tx.insert(tripPostLike).values({ postId, userId }).onDuplicateKeyUpdate({ set: { postId } })
        else await tx.delete(tripPostLike).where(and(eq(tripPostLike.postId, postId), eq(tripPostLike.userId, userId)))
        const [row] = await tx.select({ value: count() }).from(tripPostLike).where(eq(tripPostLike.postId, postId))
        const value = row?.value ?? 0
        await tx.update(tripPost).set({ likeCount: value }).where(eq(tripPost.id, postId))
        return value
    })
    return { count: likeCount, liked } satisfies PostLikeState
}
