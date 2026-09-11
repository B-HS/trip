import { describe, expect, test } from 'bun:test'
import { buildAcceptanceLedger, buildRevocationLedger } from '@/entities/community/community.point'
import { POINT_ACCEPTED } from '@/shared/constant/community'

const first = { commentId: 'comment-1', authorId: 'user-1' }
const second = { commentId: 'comment-2', authorId: 'user-2' }

describe('buildAcceptanceLedger', () => {
    test('첫 채택은 +10 accepted 한 건이다', () => {
        expect(buildAcceptanceLedger({ previousAccepted: null, nextAccepted: first })).toEqual([
            { userId: 'user-1', delta: POINT_ACCEPTED, reason: 'accepted', refId: 'comment-1' },
        ])
    })

    test('재채택은 옛 댓글 -10 revoked 후 새 댓글 +10 accepted 이다', () => {
        expect(buildAcceptanceLedger({ previousAccepted: first, nextAccepted: second })).toEqual([
            { userId: 'user-1', delta: -POINT_ACCEPTED, reason: 'revoked', refId: 'comment-1' },
            { userId: 'user-2', delta: POINT_ACCEPTED, reason: 'accepted', refId: 'comment-2' },
        ])
    })

    test('채택 후 재채택의 순 누적은 새 작성자 +10 이다', () => {
        const firstRun = buildAcceptanceLedger({ previousAccepted: null, nextAccepted: first })
        const secondRun = buildAcceptanceLedger({ previousAccepted: first, nextAccepted: second })
        const net = [...firstRun, ...secondRun].reduce((total, entry) => total + entry.delta, 0)
        expect(firstRun.map((entry) => entry.delta)).toEqual([POINT_ACCEPTED])
        expect(secondRun.map((entry) => entry.delta)).toEqual([-POINT_ACCEPTED, POINT_ACCEPTED])
        expect(net).toBe(POINT_ACCEPTED)
    })

    test('같은 댓글 재채택은 no-op 이다', () => {
        expect(buildAcceptanceLedger({ previousAccepted: first, nextAccepted: first })).toEqual([])
    })
})

describe('buildRevocationLedger', () => {
    test('채택 댓글 삭제는 -10 revoked 한 건이다', () => {
        expect(buildRevocationLedger(first)).toEqual([{ userId: 'user-1', delta: -POINT_ACCEPTED, reason: 'revoked', refId: 'comment-1' }])
    })
})
