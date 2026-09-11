import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import type { PostAuthor } from '@/entities/community/community.type'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripUserBlock } from '@/shared/db/schema/community'

export const findBlockedIdsForUser = async (blockerId: string) => {
    const rows = await getDb().select({ blockedId: tripUserBlock.blockedId }).from(tripUserBlock).where(eq(tripUserBlock.blockerId, blockerId))
    return rows.map((row) => row.blockedId)
}

/** Lists users blocked by a blocker, newest first, with author display fields. */
export const findBlockedUsersForUser = async (blockerId: string): Promise<PostAuthor[]> => {
    const rows = await getDb()
        .select({ id: user.id, name: user.name, username: user.username, image: user.image })
        .from(tripUserBlock)
        .innerJoin(user, eq(tripUserBlock.blockedId, user.id))
        .where(eq(tripUserBlock.blockerId, blockerId))
        .orderBy(desc(tripUserBlock.createdAt))
    return rows.map((row) => row satisfies PostAuthor)
}

export const blockUser = async (blockerId: string, blockedId: string) => {
    await getDb().insert(tripUserBlock).values({ blockerId, blockedId }).onDuplicateKeyUpdate({ set: { blockedId } })
    return { blockerId, blockedId }
}

export const unblockUser = async (blockerId: string, blockedId: string) => {
    await getDb()
        .delete(tripUserBlock)
        .where(and(eq(tripUserBlock.blockerId, blockerId), eq(tripUserBlock.blockedId, blockedId)))
    return { blockerId, blockedId }
}
