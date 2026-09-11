import { describe, expect, test } from 'bun:test'
import { projectComments, type CommentProjectionRow } from '@/entities/community/community.comment'

const POST_ID = 'post-1'

const authorOf = (id: string) => ({ id, name: `사용자 ${id}`, username: id, image: null })

const makeRow = (id: string, parentId: string | null, authorId: string, deletedAt: Date | null, minute: number): CommentProjectionRow => ({
    id,
    postId: POST_ID,
    parentId,
    author: authorOf(authorId),
    body: `본문 ${id}`,
    isAccepted: false,
    deletedAt,
    createdAt: new Date(Date.UTC(2026, 8, 11, 0, minute)),
})

const NO_BLOCK = new Set<string>()

describe('projectComments', () => {
    test('일반 댓글은 그대로 통과한다', () => {
        const rows = [makeRow('c1', null, 'u1', null, 1)]
        const result = projectComments(rows, NO_BLOCK)
        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('c1')
        expect(result[0]?.body).toBe('본문 c1')
        expect(result[0]?.isDeleted).toBe(false)
    })

    test('삭제된 댓글은 답글이 없으면 완전히 제외된다', () => {
        const rows = [makeRow('c1', null, 'u1', new Date(), 1)]
        expect(projectComments(rows, NO_BLOCK)).toHaveLength(0)
    })

    test('삭제된 댓글은 살아 있는 답글이 있으면 자리 표시자로 남는다', () => {
        const rows = [makeRow('c1', null, 'u1', new Date(), 1), makeRow('c2', 'c1', 'u2', null, 2)]
        const result = projectComments(rows, NO_BLOCK)
        expect(result.map((comment) => comment.id)).toEqual(['c1', 'c2'])
        expect(result[0]?.isDeleted).toBe(true)
        expect(result[0]?.body).toBeNull()
        expect(result[1]?.isDeleted).toBe(false)
    })

    test('살아 있는 손자 댓글만 있어도 삭제된 조상은 자리 표시자로 남는다', () => {
        const rows = [makeRow('c1', null, 'u1', new Date(), 1), makeRow('c2', 'c1', 'u2', new Date(), 2), makeRow('c3', 'c2', 'u3', null, 3)]
        const result = projectComments(rows, NO_BLOCK)
        expect(result.map((comment) => comment.id)).toEqual(['c1', 'c2', 'c3'])
        expect(result[0]?.isDeleted).toBe(true)
        expect(result[1]?.isDeleted).toBe(true)
    })

    test('차단된 사용자의 댓글은 완전히 제외된다', () => {
        const rows = [makeRow('c1', null, 'u1', null, 1), makeRow('c2', null, 'u2', null, 2)]
        const result = projectComments(rows, new Set(['u2']))
        expect(result.map((comment) => comment.id)).toEqual(['c1'])
    })

    test('차단 우선: 차단된 사용자의 삭제 댓글은 답글이 있어도 자리 표시자로 남지 않는다', () => {
        const rows = [makeRow('c1', null, 'u2', new Date(), 1), makeRow('c2', 'c1', 'u3', null, 2)]
        const result = projectComments(rows, new Set(['u2']))
        expect(result.map((comment) => comment.id)).toEqual(['c2'])
    })

    test('답글 작성자도 차단되면 그 삭제 부모는 제외된다', () => {
        const rows = [makeRow('c1', null, 'u1', new Date(), 1), makeRow('c2', 'c1', 'u2', null, 2)]
        const result = projectComments(rows, new Set(['u2']))
        expect(result).toHaveLength(0)
    })

    test('삭제된 채택 댓글은 표시에서 채택 상태가 해제된다', () => {
        const rows = [{ ...makeRow('c1', null, 'u1', new Date(), 1), isAccepted: true }, makeRow('c2', 'c1', 'u2', null, 2)]
        const result = projectComments(rows, NO_BLOCK)
        expect(result[0]?.isDeleted).toBe(true)
        expect(result[0]?.isAccepted).toBe(false)
    })
})
