import 'server-only'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/shared/db/client'
import { tripUserBlock } from '@/shared/db/schema/community'

export const findBlockedIdsForUser = async (blockerId: string) => {
    const rows = await getDb().select({ blockedId: tripUserBlock.blockedId }).from(tripUserBlock).where(eq(tripUserBlock.blockerId, blockerId))
    return rows.map((row) => row.blockedId)
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
