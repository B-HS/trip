import { z } from 'zod'
import {
    BOARD_KEY_MAX_LENGTH,
    BOARD_KEY_PATTERN,
    COMMENT_BODY_MAX_LENGTH,
    EXPLORE_SORTS,
    PAGE_PARAM,
    POST_TITLE_MAX_LENGTH,
    REPORT_MEMO_MAX_LENGTH,
    REPORT_KINDS,
    REPORT_REASONS,
    SEARCH_QUERY_MAX_LENGTH,
    SEARCH_QUERY_PARAM,
    SORT_PARAM,
} from '@/shared/constant/community'
import { isRichTextEmpty, richTextDocumentSchema } from '@/shared/lib/rich-text-document'

const FIRST_PAGE = 1
const EMPTY_SEARCH_QUERY = ''
const DEFAULT_EXPLORE_SORT = 'recent'

export const boardKeySchema = z
    .string()
    .trim()
    .min(1, 'validation.boardRequired')
    .max(BOARD_KEY_MAX_LENGTH, 'validation.boardKeyTooLong')
    .regex(BOARD_KEY_PATTERN, 'validation.boardKeyPattern')

export const postIdSchema = z.uuid()

export const commentIdSchema = z.uuid()

export const likeFlagSchema = z.boolean()

export const pageSchema = z.coerce.number().int().min(FIRST_PAGE).catch(FIRST_PAGE)

export const postBodySchema = richTextDocumentSchema.refine((body) => !isRichTextEmpty(body), 'validation.bodyRequired')

export const postCreateSchema = z.object({
    boardKey: boardKeySchema,
    title: z.string().trim().min(1, 'validation.titleRequired').max(POST_TITLE_MAX_LENGTH, 'validation.titleTooLong'),
    body: postBodySchema,
    tripId: z.uuid().nullable().default(null),
})

export const postUpdateSchema = postCreateSchema.omit({ boardKey: true })

export const commentCreateSchema = z.object({
    parentId: z.uuid().nullable().default(null),
    body: z.string().trim().min(1, 'validation.commentRequired').max(COMMENT_BODY_MAX_LENGTH, 'validation.commentTooLong'),
})

export const postSearchSchema = z.object({
    [PAGE_PARAM]: pageSchema,
    [SEARCH_QUERY_PARAM]: z.string().trim().max(SEARCH_QUERY_MAX_LENGTH).catch(EMPTY_SEARCH_QUERY),
})

export const exploreSearchSchema = z.object({
    [PAGE_PARAM]: pageSchema,
    [SORT_PARAM]: z.enum(EXPLORE_SORTS).catch(DEFAULT_EXPLORE_SORT),
})

export const reportCreateSchema = z.object({
    kind: z.enum(REPORT_KINDS, 'validation.reportKindRequired'),
    targetId: z.uuid('validation.reportTargetNotFound'),
    reason: z.enum(REPORT_REASONS, 'validation.reportReasonRequired'),
    memo: z.string().trim().max(REPORT_MEMO_MAX_LENGTH, 'validation.memoTooLong').nullable().default(null),
})

export type BoardKeyInput = z.input<typeof boardKeySchema>
export type PostCreateInput = z.input<typeof postCreateSchema>
export type PostCreateValues = z.output<typeof postCreateSchema>
export type PostUpdateInput = z.input<typeof postUpdateSchema>
export type PostUpdateValues = z.output<typeof postUpdateSchema>
export type CommentCreateInput = z.input<typeof commentCreateSchema>
export type CommentCreateValues = z.output<typeof commentCreateSchema>
export type PostSearchInput = z.input<typeof postSearchSchema>
export type PostSearchValues = z.output<typeof postSearchSchema>
export type ExploreSearchInput = z.input<typeof exploreSearchSchema>
export type ExploreSearchValues = z.output<typeof exploreSearchSchema>
export type ReportCreateInput = z.input<typeof reportCreateSchema>
export type ReportCreateValues = z.output<typeof reportCreateSchema>
