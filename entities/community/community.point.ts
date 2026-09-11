import { POINT_ACCEPTED, type PointReason } from '@/shared/constant/community'

export type PointLedgerEntry = {
    userId: string
    delta: number
    reason: PointReason
    refId: string
}

export type AcceptedCommentRef = {
    commentId: string
    authorId: string
}

/**
 * Builds the ledger entries for accepting (or re-accepting) a comment.
 * First acceptance pays `+accepted`. Changing acceptance revokes the previous
 * accepted comment with `-revoked` and pays the new one `+accepted`.
 * Re-accepting the same comment is a no-op.
 */
export const buildAcceptanceLedger = (input: {
    previousAccepted: AcceptedCommentRef | null
    nextAccepted: AcceptedCommentRef
}): PointLedgerEntry[] => {
    if (input.previousAccepted !== null && input.previousAccepted.commentId === input.nextAccepted.commentId) return []
    const revoked =
        input.previousAccepted === null
            ? []
            : [
                  {
                      userId: input.previousAccepted.authorId,
                      delta: -POINT_ACCEPTED,
                      reason: 'revoked' as const,
                      refId: input.previousAccepted.commentId,
                  },
              ]
    return [
        ...revoked,
        { userId: input.nextAccepted.authorId, delta: POINT_ACCEPTED, reason: 'accepted' as const, refId: input.nextAccepted.commentId },
    ]
}

/**
 * Builds the ledger entry that revokes an accepted comment (e.g. when the accepted
 * comment is soft-deleted).
 */
export const buildRevocationLedger = (accepted: AcceptedCommentRef): PointLedgerEntry[] => [
    { userId: accepted.authorId, delta: -POINT_ACCEPTED, reason: 'revoked' as const, refId: accepted.commentId },
]
