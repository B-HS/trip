export type CommentProjectionRow = {
    id: string
    postId: string
    parentId: string | null
    author: { id: string; name: string; username: string | null; image: string | null }
    body: string
    isAccepted: boolean
    deletedAt: Date | null
    createdAt: Date
}

export type ProjectedComment = {
    id: string
    postId: string
    parentId: string | null
    author: CommentProjectionRow['author']
    body: string | null
    isAccepted: boolean
    isDeleted: boolean
    createdAt: string
}

const hasSurvivingDescendant = (rowId: string, childrenByParentId: Map<string, CommentProjectionRow[]>) => {
    const queue = [...(childrenByParentId.get(rowId) ?? [])]
    while (queue.length > 0) {
        const child = queue.shift()
        if (child === undefined) continue
        if (child.deletedAt === null) return true
        queue.push(...(childrenByParentId.get(child.id) ?? []))
    }
    return false
}

/**
 * Projects raw comment rows (including soft-deleted ones) into viewer-facing comments.
 * Rows authored by blocked users are dropped entirely. A soft-deleted comment survives
 * only as a placeholder (`isDeleted: true`, `body: null`) when it has a surviving,
 * non-blocked descendant; otherwise it is dropped.
 */
export const projectComments = (rows: CommentProjectionRow[], blockedIds: ReadonlySet<string>): ProjectedComment[] => {
    const visibleRows = rows.filter((row) => !blockedIds.has(row.author.id))
    const childrenByParentId = new Map<string, CommentProjectionRow[]>()
    for (const row of visibleRows) {
        if (row.parentId === null) continue
        const siblings = childrenByParentId.get(row.parentId)
        if (siblings === undefined) childrenByParentId.set(row.parentId, [row])
        else siblings.push(row)
    }
    return visibleRows
        .filter((row) => row.deletedAt === null || hasSurvivingDescendant(row.id, childrenByParentId))
        .map(
            (row) =>
                ({
                    id: row.id,
                    postId: row.postId,
                    parentId: row.parentId,
                    author: row.author,
                    body: row.deletedAt === null ? row.body : null,
                    isAccepted: row.deletedAt === null ? row.isAccepted : false,
                    isDeleted: row.deletedAt !== null,
                    createdAt: row.createdAt.toISOString(),
                }) satisfies ProjectedComment,
        )
}
