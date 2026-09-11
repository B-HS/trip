import { describe, expect, test } from 'bun:test'
import { canAcceptComment, canAttachTrip, canEditPost, isBlockedAuthor, canManageComment, canManagePost } from '@/entities/community/community.role'
import { ADMIN_ROLE, DEFAULT_USER_ROLE } from '@/shared/constant/auth'

const AUTHOR_ID = 'author-1'
const OTHER_ID = 'user-2'

const author = { id: AUTHOR_ID, role: DEFAULT_USER_ROLE }
const other = { id: OTHER_ID, role: DEFAULT_USER_ROLE }
const admin = { id: 'admin-1', role: ADMIN_ROLE }

const qnaPost = { authorId: AUTHOR_ID, boardKind: 'qna' } as const
const freePost = { authorId: AUTHOR_ID, boardKind: 'free' } as const
const answer = { authorId: OTHER_ID, parentId: null, isAccepted: false }

describe('canManagePost', () => {
    test('작성자면 관리할 수 있다', () => {
        expect(canManagePost(author, AUTHOR_ID)).toBe(true)
    })

    test('관리자면 남의 글도 관리할 수 있다', () => {
        expect(canManagePost(admin, AUTHOR_ID)).toBe(true)
    })

    test('다른 사용자는 관리할 수 없다', () => {
        expect(canManagePost(other, AUTHOR_ID)).toBe(false)
    })

    test('비로그인은 관리할 수 없다', () => {
        expect(canManagePost(null, AUTHOR_ID)).toBe(false)
    })

    test('역할이 없어도 작성자면 관리할 수 있다', () => {
        expect(canManagePost({ id: AUTHOR_ID }, AUTHOR_ID)).toBe(true)
    })
})

describe('canEditPost', () => {
    test('작성자면 수정할 수 있다', () => {
        expect(canEditPost(author, AUTHOR_ID)).toBe(true)
    })

    test('관리자여도 남의 글은 수정할 수 없다', () => {
        expect(canEditPost(admin, AUTHOR_ID)).toBe(false)
    })

    test('다른 사용자는 수정할 수 없다', () => {
        expect(canEditPost(other, AUTHOR_ID)).toBe(false)
    })

    test('비로그인은 수정할 수 없다', () => {
        expect(canEditPost(null, AUTHOR_ID)).toBe(false)
    })
})

describe('canManageComment', () => {
    test('작성자와 관리자만 관리할 수 있다', () => {
        expect(canManageComment(other, OTHER_ID)).toBe(true)
        expect(canManageComment(admin, OTHER_ID)).toBe(true)
        expect(canManageComment(author, OTHER_ID)).toBe(false)
        expect(canManageComment(null, OTHER_ID)).toBe(false)
    })
})

describe('canAcceptComment', () => {
    test('질문 작성자가 남의 최상위 댓글을 채택할 수 있다', () => {
        expect(canAcceptComment(author, qnaPost, answer)).toBe(true)
    })

    test('질문 게시판이 아니면 채택할 수 없다', () => {
        expect(canAcceptComment(author, freePost, answer)).toBe(false)
    })

    test('질문 작성자가 아니면 채택할 수 없다', () => {
        expect(canAcceptComment(other, qnaPost, answer)).toBe(false)
    })

    test('관리자여도 질문 작성자가 아니면 채택할 수 없다', () => {
        expect(canAcceptComment(admin, qnaPost, answer)).toBe(false)
    })

    test('답글은 채택할 수 없다', () => {
        expect(canAcceptComment(author, qnaPost, { ...answer, parentId: 'comment-1' })).toBe(false)
    })

    test('자기 댓글은 채택할 수 없다', () => {
        expect(canAcceptComment(author, qnaPost, { ...answer, authorId: AUTHOR_ID })).toBe(false)
    })

    test('이미 채택된 댓글은 다시 채택할 수 없다', () => {
        expect(canAcceptComment(author, qnaPost, { ...answer, isAccepted: true })).toBe(false)
    })

    test('비로그인은 채택할 수 없다', () => {
        expect(canAcceptComment(null, qnaPost, answer)).toBe(false)
    })
})

describe('canAttachTrip', () => {
    const ownPrivateTrip = { ownerId: AUTHOR_ID, isPublic: false }
    const ownPublicTrip = { ownerId: AUTHOR_ID, isPublic: true }
    const otherPrivateTrip = { ownerId: OTHER_ID, isPublic: false }
    const otherPublicTrip = { ownerId: OTHER_ID, isPublic: true }

    test('본인 소유 비공개 트립도 첨부할 수 있다', () => {
        expect(canAttachTrip(author, ownPrivateTrip)).toBe(true)
    })

    test('남의 공개 트립은 첨부할 수 있다', () => {
        expect(canAttachTrip(author, otherPublicTrip)).toBe(true)
    })

    test('남의 비공개 트립은 첨부할 수 없다', () => {
        expect(canAttachTrip(author, otherPrivateTrip)).toBe(false)
    })

    test('관리자여도 남의 비공개 트립은 첨부할 수 없다', () => {
        expect(canAttachTrip(admin, otherPrivateTrip)).toBe(false)
    })

    test('비로그인은 첨부할 수 없다', () => {
        expect(canAttachTrip(null, ownPublicTrip)).toBe(false)
    })
})

describe('isBlockedAuthor', () => {
    test('차단 목록에 있으면 참이다', () => {
        expect(isBlockedAuthor(new Set([OTHER_ID]), OTHER_ID)).toBe(true)
    })

    test('차단 목록에 없으면 거짓이다', () => {
        expect(isBlockedAuthor(new Set([OTHER_ID]), AUTHOR_ID)).toBe(false)
    })

    test('빈 목록은 아무도 차단하지 않는다', () => {
        expect(isBlockedAuthor(new Set(), AUTHOR_ID)).toBe(false)
    })
})
