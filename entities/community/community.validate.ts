import { z } from 'zod'
import {
    BOARD_KEY_MAX_LENGTH,
    BOARD_KEY_PATTERN,
    COMMENT_BODY_MAX_LENGTH,
    EXPLORE_SORTS,
    PAGE_PARAM,
    POST_TITLE_MAX_LENGTH,
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
    .min(1, '게시판을 선택해 주세요.')
    .max(BOARD_KEY_MAX_LENGTH, `게시판 주소는 ${BOARD_KEY_MAX_LENGTH}자 이하여야 합니다.`)
    .regex(BOARD_KEY_PATTERN, '게시판 주소는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.')

export const postIdSchema = z.uuid()

export const commentIdSchema = z.uuid()

export const likeFlagSchema = z.boolean()

export const pageSchema = z.coerce.number().int().min(FIRST_PAGE).catch(FIRST_PAGE)

export const postBodySchema = richTextDocumentSchema.refine((body) => !isRichTextEmpty(body), '본문을 입력해 주세요.')

export const postCreateSchema = z.object({
    boardKey: boardKeySchema,
    title: z.string().trim().min(1, '제목을 입력해 주세요.').max(POST_TITLE_MAX_LENGTH, `제목은 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`),
    body: postBodySchema,
    tripId: z.uuid().nullable().default(null),
})

export const postUpdateSchema = postCreateSchema.omit({ boardKey: true })

export const commentCreateSchema = z.object({
    parentId: z.uuid().nullable().default(null),
    body: z.string().trim().min(1, '댓글을 입력해 주세요.').max(COMMENT_BODY_MAX_LENGTH, `댓글은 ${COMMENT_BODY_MAX_LENGTH}자 이하로 입력해 주세요.`),
})

export const postSearchSchema = z.object({
    [PAGE_PARAM]: pageSchema,
    [SEARCH_QUERY_PARAM]: z.string().trim().max(SEARCH_QUERY_MAX_LENGTH).catch(EMPTY_SEARCH_QUERY),
})

export const exploreSearchSchema = z.object({
    [PAGE_PARAM]: pageSchema,
    [SORT_PARAM]: z.enum(EXPLORE_SORTS).catch(DEFAULT_EXPLORE_SORT),
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
