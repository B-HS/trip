import { describe, expect, test } from 'bun:test'
import {
    commentCreateSchema,
    exploreSearchSchema,
    postCreateSchema,
    postSearchSchema,
    postUpdateSchema,
    reportCreateSchema,
} from '@/entities/community/community.validate'
import { COMMENT_BODY_MAX_LENGTH, POST_TITLE_MAX_LENGTH, REPORT_MEMO_MAX_LENGTH, SEARCH_QUERY_MAX_LENGTH } from '@/shared/constant/community'
import { EMPTY_RICH_TEXT_DOCUMENT, type RichTextDocument } from '@/shared/lib/rich-text-document'

const TRIP_ID = '0f2f4b3a-4b1e-4f0a-9b3d-3f4c9d1e6a11'

const paragraph = (text: string): RichTextDocument => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })

const validPost = { boardKey: 'free', title: '오사카 3박 4일 후기', body: paragraph('본문입니다.') }

describe('postCreateSchema', () => {
    test('올바른 값이면 통과하고 tripId 기본값은 null 이다', () => {
        const result = postCreateSchema.safeParse(validPost)
        expect(result.success).toBe(true)
        expect(result.data?.tripId).toBeNull()
    })

    test('제목 앞뒤 공백을 제거한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, title: '  제목  ' }).data?.title).toBe('제목')
    })

    test('제목이 비어 있으면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, title: '   ' }).success).toBe(false)
    })

    test('제목이 최대 길이를 넘으면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, title: 'a'.repeat(POST_TITLE_MAX_LENGTH + 1) }).success).toBe(false)
    })

    test('본문이 비어 있으면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, body: EMPTY_RICH_TEXT_DOCUMENT }).success).toBe(false)
    })

    test('본문 형식이 올바르지 않으면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, body: { type: 'paragraph' } }).success).toBe(false)
    })

    test('게시판 주소 형식이 올바르지 않으면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, boardKey: 'Free Board' }).success).toBe(false)
    })

    test('tripId 가 uuid 가 아니면 실패한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, tripId: 'trip-1' }).success).toBe(false)
    })

    test('tripId 가 uuid 면 그대로 통과한다', () => {
        expect(postCreateSchema.safeParse({ ...validPost, tripId: TRIP_ID }).data?.tripId).toBe(TRIP_ID)
    })
})

describe('postUpdateSchema', () => {
    test('게시판 주소 없이 통과한다', () => {
        const result = postUpdateSchema.safeParse({ title: validPost.title, body: validPost.body })
        expect(result.success).toBe(true)
        expect(result.data).not.toHaveProperty('boardKey')
    })
})

describe('commentCreateSchema', () => {
    test('parentId 기본값은 null 이다', () => {
        expect(commentCreateSchema.safeParse({ body: '댓글' }).data?.parentId).toBeNull()
    })

    test('본문이 비어 있으면 실패한다', () => {
        expect(commentCreateSchema.safeParse({ body: '   ' }).success).toBe(false)
    })

    test('본문이 최대 길이를 넘으면 실패한다', () => {
        expect(commentCreateSchema.safeParse({ body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH + 1) }).success).toBe(false)
    })
})

describe('postSearchSchema', () => {
    test('값이 없으면 첫 페이지와 빈 검색어를 채운다', () => {
        expect(postSearchSchema.parse({})).toEqual({ page: 1, q: '' })
    })

    test('문자열 페이지를 숫자로 바꾼다', () => {
        expect(postSearchSchema.parse({ page: '3' }).page).toBe(3)
    })

    test('잘못된 페이지는 첫 페이지로 되돌린다', () => {
        expect(postSearchSchema.parse({ page: 'abc' }).page).toBe(1)
        expect(postSearchSchema.parse({ page: '0' }).page).toBe(1)
    })

    test('검색어가 최대 길이를 넘으면 빈 문자열로 되돌린다', () => {
        expect(postSearchSchema.parse({ q: 'a'.repeat(SEARCH_QUERY_MAX_LENGTH + 1) }).q).toBe('')
    })
})

describe('exploreSearchSchema', () => {
    test('값이 없으면 최신순 첫 페이지다', () => {
        expect(exploreSearchSchema.parse({})).toEqual({ page: 1, sort: 'recent' })
    })

    test('인기순을 그대로 통과시킨다', () => {
        expect(exploreSearchSchema.parse({ sort: 'popular' }).sort).toBe('popular')
    })

    test('모르는 정렬은 최신순으로 되돌린다', () => {
        expect(exploreSearchSchema.parse({ sort: 'oldest' }).sort).toBe('recent')
    })
})

describe('reportCreateSchema', () => {
    const validReport = { kind: 'post', targetId: TRIP_ID, reason: 'spam' }

    test('올바른 신고면 통과하고 메모 기본값은 null 이다', () => {
        const result = reportCreateSchema.safeParse(validReport)
        expect(result.success).toBe(true)
        expect(result.data?.memo).toBeNull()
    })

    test('모르는 신고 유형은 실패한다', () => {
        expect(reportCreateSchema.safeParse({ ...validReport, kind: 'trip' }).success).toBe(false)
    })

    test('모르는 신고 사유는 실패한다', () => {
        expect(reportCreateSchema.safeParse({ ...validReport, reason: 'rude' }).success).toBe(false)
    })

    test('신고 대상 id 가 uuid 가 아니면 실패한다', () => {
        expect(reportCreateSchema.safeParse({ ...validReport, targetId: 'post-1' }).success).toBe(false)
    })

    test('메모가 최대 길이를 넘으면 실패한다', () => {
        expect(reportCreateSchema.safeParse({ ...validReport, memo: 'a'.repeat(REPORT_MEMO_MAX_LENGTH + 1) }).success).toBe(false)
    })

    test('댓글·사용자 신고를 통과시킨다', () => {
        expect(reportCreateSchema.safeParse({ ...validReport, kind: 'comment' }).success).toBe(true)
        expect(reportCreateSchema.safeParse({ ...validReport, kind: 'user' }).success).toBe(true)
    })
})
