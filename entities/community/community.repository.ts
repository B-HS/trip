import 'server-only'
import { and, asc, count, desc, eq, isNotNull, isNull, like, notInArray, or, sql, type SQL } from 'drizzle-orm'
import { findBlockedIdsForUser } from '@/entities/community/community.repository.block'
import type { Board, Post, PostAuthor, PostDetail, PostListItem, PostPage, PostTripLink, TripAttachOption } from '@/entities/community/community.type'
import type { PostCreateValues, PostUpdateValues } from '@/entities/community/community.validate'
import { PAGE_SIZE, POST_EXCERPT_MAX_LENGTH, type BoardKind } from '@/shared/constant/community'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripBoard, tripPost } from '@/shared/db/schema/community'
import { trip } from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'
import { buildPage } from '@/shared/lib/pagination'
import { richTextPlainText } from '@/shared/lib/rich-text-document'

const BOARD_NOT_FOUND = 'error.boardNotFound'
const POST_NOT_FOUND = 'error.postNotFound'
const LIKE_SPECIAL_PATTERN = /[\\%_]/g

type PostListRow = {
    post: Pick<Post, 'id' | 'title' | 'excerpt' | 'tripId' | 'viewCount' | 'likeCount' | 'commentCount' | 'acceptedCommentId' | 'createdAt'>
    board: Pick<Board, 'key' | 'kind'>
    author: PostAuthor
}

const escapeLikeTerm = (value: string) => value.replace(LIKE_SPECIAL_PATTERN, (match) => `\\${match}`)

const postColumns = {
    id: tripPost.id,
    title: tripPost.title,
    excerpt: tripPost.excerpt,
    tripId: tripPost.tripId,
    viewCount: tripPost.viewCount,
    likeCount: tripPost.likeCount,
    commentCount: tripPost.commentCount,
    acceptedCommentId: tripPost.acceptedCommentId,
    createdAt: tripPost.createdAt,
}

const authorColumns = { id: user.id, name: user.name, username: user.username, image: user.image }

const postListSelection = { post: postColumns, board: { key: tripBoard.key, kind: tripBoard.kind }, author: authorColumns }

const postDetailSelection = {
    post: { ...postColumns, body: tripPost.body, updatedAt: tripPost.updatedAt },
    board: { key: tripBoard.key, name: tripBoard.name, kind: tripBoard.kind },
    author: authorColumns,
    trip: { id: trip.id, title: trip.title, shareSlug: trip.shareSlug, isPublic: trip.isPublic },
}

const toPostListItem = (row: PostListRow) =>
    ({
        id: row.post.id,
        boardKey: row.board.key,
        boardKind: row.board.kind,
        title: row.post.title,
        excerpt: row.post.excerpt,
        author: row.author,
        tripId: row.post.tripId,
        viewCount: row.post.viewCount,
        likeCount: row.post.likeCount,
        commentCount: row.post.commentCount,
        hasAcceptedComment: row.post.acceptedCommentId !== null,
        createdAt: row.post.createdAt.toISOString(),
    }) satisfies PostListItem

const toPostTripLink = (row: PostTripLink | null) => (row === null || row.isPublic ? row : { ...row, shareSlug: null })

const visiblePostsCondition = async (viewerId: string | null) => {
    const conditions: SQL[] = [isNull(tripPost.deletedAt)]
    if (viewerId !== null) {
        const blockedIds = await findBlockedIdsForUser(viewerId)
        if (blockedIds.length > 0) conditions.push(notInArray(tripPost.authorId, blockedIds))
    }
    return and(...conditions)
}

const selectPosts = () =>
    getDb()
        .select(postListSelection)
        .from(tripPost)
        .innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id))
        .innerJoin(user, eq(tripPost.authorId, user.id))

const countPosts = async (condition: SQL | undefined) => {
    const [row] = await getDb().select({ value: count() }).from(tripPost).innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id)).where(condition)
    return row?.value ?? 0
}

const findPostPageBy = async (condition: SQL | undefined, page: number) => {
    const total = await countPosts(condition)
    const pageInfo = buildPage(total, page, PAGE_SIZE)
    const rows = await selectPosts().where(condition).orderBy(desc(tripPost.createdAt)).limit(pageInfo.pageSize).offset(pageInfo.offset)
    return {
        items: rows.map(toPostListItem),
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        total: pageInfo.total,
        pageCount: pageInfo.pageCount,
    } satisfies PostPage
}

export const findBoards = async () => getDb().select().from(tripBoard).orderBy(asc(tripBoard.sortOrder), asc(tripBoard.createdAt))

export const findBoardByKey = async (key: string) => {
    const [row] = await getDb().select().from(tripBoard).where(eq(tripBoard.key, key)).limit(1)
    return row ?? null
}

export const findPostPage = async ({
    boardKey,
    page,
    q,
    viewerId = null,
}: {
    boardKey: string
    page: number
    q: string
    viewerId?: string | null
}) => {
    const conditions = [eq(tripBoard.key, boardKey), await visiblePostsCondition(viewerId)]
    if (q.length > 0) conditions.push(like(tripPost.title, `%${escapeLikeTerm(q)}%`))
    return findPostPageBy(and(...conditions), page)
}

export const findPostsByAuthor = async (userId: string, page: number, viewerId: string | null = null) =>
    findPostPageBy(and(eq(tripPost.authorId, userId), await visiblePostsCondition(viewerId)), page)

export const findLatestPostsByBoard = async (boardKey: string, limit: number, viewerId: string | null = null) => {
    const rows = await selectPosts()
        .where(and(eq(tripBoard.key, boardKey), await visiblePostsCondition(viewerId)))
        .orderBy(desc(tripPost.createdAt))
        .limit(limit)
    return rows.map(toPostListItem)
}

export const findLatestPosts = async (limit: number, kind?: BoardKind, viewerId: string | null = null) => {
    const conditions = [await visiblePostsCondition(viewerId)]
    if (kind !== undefined) conditions.push(eq(tripBoard.kind, kind))
    const rows = await selectPosts()
        .where(and(...conditions))
        .orderBy(desc(tripPost.createdAt))
        .limit(limit)
    return rows.map(toPostListItem)
}

export const findPostDetail = async (postId: string, viewerId: string | null = null) => {
    const [row] = await getDb()
        .select(postDetailSelection)
        .from(tripPost)
        .innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id))
        .innerJoin(user, eq(tripPost.authorId, user.id))
        .leftJoin(trip, eq(tripPost.tripId, trip.id))
        .where(and(eq(tripPost.id, postId), await visiblePostsCondition(viewerId)))
        .limit(1)
    if (!row) return null
    return {
        ...toPostListItem(row),
        body: row.post.body,
        updatedAt: row.post.updatedAt.toISOString(),
        board: row.board,
        trip: toPostTripLink(row.trip),
    } satisfies PostDetail
}

export const findBoardKeyByPostId = async (postId: string) => {
    const [row] = await getDb()
        .select({ boardKey: tripBoard.key })
        .from(tripPost)
        .innerJoin(tripBoard, eq(tripPost.boardId, tripBoard.id))
        .where(eq(tripPost.id, postId))
        .limit(1)
    return row?.boardKey ?? null
}

export const incrementPostView = async (postId: string) => {
    await getDb()
        .update(tripPost)
        .set({ viewCount: sql`${tripPost.viewCount} + 1` })
        .where(eq(tripPost.id, postId))
}

export const createPost = async (authorId: string, values: PostCreateValues) => {
    const board = await findBoardByKey(values.boardKey)
    if (board === null) throw new ApiError('NOT_FOUND', BOARD_NOT_FOUND)
    const id = crypto.randomUUID()
    await getDb()
        .insert(tripPost)
        .values({
            id,
            boardId: board.id,
            authorId,
            title: values.title,
            body: values.body,
            excerpt: richTextPlainText(values.body, POST_EXCERPT_MAX_LENGTH),
            tripId: values.tripId,
        })
    return { id }
}

export const updatePost = async (postId: string, values: PostUpdateValues) => {
    await getDb()
        .update(tripPost)
        .set({
            title: values.title,
            body: values.body,
            excerpt: richTextPlainText(values.body, POST_EXCERPT_MAX_LENGTH),
            tripId: values.tripId,
            updatedAt: new Date(),
        })
        .where(eq(tripPost.id, postId))
    return { id: postId }
}

export const deletePost = async (postId: string) => {
    const [row] = await getDb()
        .select({ id: tripPost.id })
        .from(tripPost)
        .where(and(eq(tripPost.id, postId), isNull(tripPost.deletedAt)))
        .limit(1)
    if (!row) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    await getDb().update(tripPost).set({ deletedAt: new Date() }).where(eq(tripPost.id, postId))
    return { id: postId }
}

export const restorePost = async (postId: string) => {
    const result = await getDb()
        .update(tripPost)
        .set({ deletedAt: null })
        .where(and(eq(tripPost.id, postId), isNotNull(tripPost.deletedAt)))
    if (result[0].affectedRows === 0) throw new ApiError('NOT_FOUND', POST_NOT_FOUND)
    return { id: postId }
}

export const findAttachTripOptions = async (userId: string): Promise<TripAttachOption[]> =>
    getDb()
        .select({ id: trip.id, title: trip.title, isPublic: trip.isPublic })
        .from(trip)
        .where(or(eq(trip.ownerId, userId), eq(trip.isPublic, true)))
        .orderBy(desc(trip.updatedAt))
