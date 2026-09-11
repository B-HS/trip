import { relations } from 'drizzle-orm'
import { boolean, index, int, json, mysqlEnum, primaryKey, text, timestamp, uniqueIndex, varchar, type AnyMySqlColumn } from 'drizzle-orm/mysql-core'
import {
    BOARD_DESCRIPTION_MAX_LENGTH,
    BOARD_KEY_MAX_LENGTH,
    BOARD_KINDS,
    BOARD_NAME_MAX_LENGTH,
    POINT_REASONS,
    POST_EXCERPT_MAX_LENGTH,
    POST_TITLE_MAX_LENGTH,
    REPORT_KINDS,
    REPORT_MEMO_MAX_LENGTH,
    REPORT_REASONS,
    REPORT_STATUSES,
    REPORT_TARGET_ID_MAX_LENGTH,
} from '@/shared/constant/community'
import { user } from '@/shared/db/schema/auth'
import { trip } from '@/shared/db/schema/trip'
import { tripTable } from '@/shared/db/table'
import type { RichTextDocument } from '@/shared/lib/rich-text-document'

const id = () =>
    varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID())

const createdAt = () => timestamp('created_at', { fsp: 3 }).defaultNow().notNull()

const updatedAt = () => timestamp('updated_at', { fsp: 3 }).defaultNow().notNull()

export const tripBoard = tripTable(
    'board',
    {
        id: id(),
        key: varchar('key', { length: BOARD_KEY_MAX_LENGTH }).notNull(),
        name: varchar('name', { length: BOARD_NAME_MAX_LENGTH }).notNull(),
        kind: mysqlEnum('kind', BOARD_KINDS).notNull(),
        description: varchar('description', { length: BOARD_DESCRIPTION_MAX_LENGTH }),
        sortOrder: int('sort_order').notNull().default(0),
        createdAt: createdAt(),
    },
    (table) => [uniqueIndex('board_key_idx').on(table.key)],
)

export const tripPost = tripTable(
    'post',
    {
        id: id(),
        boardId: varchar('board_id', { length: 36 })
            .notNull()
            .references(() => tripBoard.id, { onDelete: 'cascade' }),
        authorId: varchar('author_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        title: varchar('title', { length: POST_TITLE_MAX_LENGTH }).notNull(),
        body: json('body').$type<RichTextDocument>().notNull(),
        excerpt: varchar('excerpt', { length: POST_EXCERPT_MAX_LENGTH }).notNull(),
        tripId: varchar('trip_id', { length: 36 }).references(() => trip.id, { onDelete: 'set null' }),
        viewCount: int('view_count').notNull().default(0),
        likeCount: int('like_count').notNull().default(0),
        commentCount: int('comment_count').notNull().default(0),
        acceptedCommentId: varchar('accepted_comment_id', { length: 36 }),
        deletedAt: timestamp('deleted_at', { fsp: 3 }),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        index('post_board_created_at_idx').on(table.boardId, table.createdAt),
        index('post_author_id_idx').on(table.authorId),
        index('post_trip_id_idx').on(table.tripId),
    ],
)

export const tripComment = tripTable(
    'comment',
    {
        id: id(),
        postId: varchar('post_id', { length: 36 })
            .notNull()
            .references(() => tripPost.id, { onDelete: 'cascade' }),
        authorId: varchar('author_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        parentId: varchar('parent_id', { length: 36 }).references((): AnyMySqlColumn => tripComment.id, { onDelete: 'cascade' }),
        body: text('body').notNull(),
        isAccepted: boolean('is_accepted').default(false).notNull(),
        deletedAt: timestamp('deleted_at', { fsp: 3 }),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [index('comment_post_id_idx').on(table.postId), index('comment_author_id_idx').on(table.authorId)],
)

export const tripReport = tripTable(
    'report',
    {
        id: id(),
        reporterId: varchar('reporter_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        kind: mysqlEnum('kind', REPORT_KINDS).notNull(),
        targetId: varchar('target_id', { length: REPORT_TARGET_ID_MAX_LENGTH }).notNull(),
        reason: mysqlEnum('reason', REPORT_REASONS).notNull(),
        memo: varchar('memo', { length: REPORT_MEMO_MAX_LENGTH }),
        status: mysqlEnum('status', REPORT_STATUSES).notNull().default('open'),
        handledBy: varchar('handled_by', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
        handledAt: timestamp('handled_at', { fsp: 3 }),
        createdAt: createdAt(),
    },
    (table) => [
        uniqueIndex('report_reporter_kind_target_idx').on(table.reporterId, table.kind, table.targetId),
        index('report_status_created_at_idx').on(table.status, table.createdAt),
    ],
)

export const tripUserBlock = tripTable(
    'user_block',
    {
        blockerId: varchar('blocker_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        blockedId: varchar('blocked_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        createdAt: createdAt(),
    },
    (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] }), index('user_block_blocked_id_idx').on(table.blockedId)],
)

export const tripPostLike = tripTable(
    'post_like',
    {
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        postId: varchar('post_id', { length: 36 })
            .notNull()
            .references(() => tripPost.id, { onDelete: 'cascade' }),
        createdAt: createdAt(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.postId] }), index('post_like_post_id_idx').on(table.postId)],
)

export const tripLike = tripTable(
    'like',
    {
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        createdAt: createdAt(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.tripId] }), index('like_trip_id_idx').on(table.tripId)],
)

export const tripPointLedger = tripTable(
    'point_ledger',
    {
        id: id(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        delta: int('delta').notNull(),
        reason: mysqlEnum('reason', POINT_REASONS).notNull(),
        refId: varchar('ref_id', { length: 36 }).notNull(),
        createdAt: createdAt(),
    },
    (table) => [uniqueIndex('point_ledger_user_reason_ref_idx').on(table.userId, table.reason, table.refId)],
)

export const tripBoardRelations = relations(tripBoard, ({ many }) => ({
    posts: many(tripPost),
}))

export const tripPostRelations = relations(tripPost, ({ one, many }) => ({
    board: one(tripBoard, { fields: [tripPost.boardId], references: [tripBoard.id] }),
    author: one(user, { fields: [tripPost.authorId], references: [user.id] }),
    trip: one(trip, { fields: [tripPost.tripId], references: [trip.id] }),
    comments: many(tripComment),
    likes: many(tripPostLike),
}))

export const tripCommentRelations = relations(tripComment, ({ one, many }) => ({
    post: one(tripPost, { fields: [tripComment.postId], references: [tripPost.id] }),
    author: one(user, { fields: [tripComment.authorId], references: [user.id] }),
    parent: one(tripComment, { fields: [tripComment.parentId], references: [tripComment.id], relationName: 'commentReplies' }),
    replies: many(tripComment, { relationName: 'commentReplies' }),
}))

export const tripPostLikeRelations = relations(tripPostLike, ({ one }) => ({
    post: one(tripPost, { fields: [tripPostLike.postId], references: [tripPost.id] }),
    user: one(user, { fields: [tripPostLike.userId], references: [user.id] }),
}))

export const tripLikeRelations = relations(tripLike, ({ one }) => ({
    trip: one(trip, { fields: [tripLike.tripId], references: [trip.id] }),
    user: one(user, { fields: [tripLike.userId], references: [user.id] }),
}))

export const tripPointLedgerRelations = relations(tripPointLedger, ({ one }) => ({
    user: one(user, { fields: [tripPointLedger.userId], references: [user.id] }),
}))

export const tripReportRelations = relations(tripReport, ({ one }) => ({
    reporter: one(user, { fields: [tripReport.reporterId], references: [user.id] }),
    handler: one(user, { fields: [tripReport.handledBy], references: [user.id], relationName: 'reportHandler' }),
}))

export const tripUserBlockRelations = relations(tripUserBlock, ({ one }) => ({
    blocker: one(user, { fields: [tripUserBlock.blockerId], references: [user.id], relationName: 'blockerBlocks' }),
    blocked: one(user, { fields: [tripUserBlock.blockedId], references: [user.id], relationName: 'blockedByBlocker' }),
}))
