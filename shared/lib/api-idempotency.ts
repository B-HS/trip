import { createHash } from 'node:crypto'
import { and, eq, lt } from 'drizzle-orm'
import { getDb } from '@/shared/db/client'
import { developerApiIdempotency } from '@/shared/db/schema/developer-api'
import { ApiError } from '@/shared/lib/api-response'

const PROCESSING_TTL_MS = 10 * 60 * 1000
export type IdempotencyReplay = { response: unknown; status: number; headers?: Record<string, string> }
export type IdempotencyClaim = { replay: IdempotencyReplay | null; claimNonce: string }

export const requestFingerprint = async (request: Request, body: unknown) => {
    const raw = JSON.stringify({ method: request.method, path: new URL(request.url).pathname, body })
    return createHash('sha256').update(raw).digest('hex')
}

export const claimIdempotency = async (tokenId: string, key: string, requestHash: string): Promise<IdempotencyClaim> => {
    const db = getDb()
    const staleBefore = new Date(Date.now() - PROCESSING_TTL_MS)
    const claimNonce = crypto.randomUUID()
    try {
        await db.insert(developerApiIdempotency).values({ tokenId, idempotencyKey: key, requestHash, status: 'processing', claimNonce })
    } catch {
        const row = await db
            .select()
            .from(developerApiIdempotency)
            .where(and(eq(developerApiIdempotency.tokenId, tokenId), eq(developerApiIdempotency.idempotencyKey, key)))
            .limit(1)
        if (!row[0]) throw new ApiError('INTERNAL_ERROR')
        if (row[0].requestHash !== requestHash) throw new ApiError('VALIDATION_ERROR', 'error.idempotencyKeyConflict')
        if (row[0].status === 'completed')
            return {
                replay: { response: row[0].response, status: row[0].responseStatus ?? 200, headers: row[0].responseHeaders ?? undefined },
                claimNonce: row[0].claimNonce,
            }
        const recovered = await db
            .update(developerApiIdempotency)
            .set({ claimedAt: new Date(), claimNonce })
            .where(
                and(
                    eq(developerApiIdempotency.tokenId, tokenId),
                    eq(developerApiIdempotency.idempotencyKey, key),
                    eq(developerApiIdempotency.status, 'processing'),
                    lt(developerApiIdempotency.claimedAt, staleBefore),
                ),
            )
        if (recovered[0].affectedRows === 0) throw new ApiError('VALIDATION_ERROR', 'error.idempotencyInProgress')
    }
    return { replay: null, claimNonce }
}

export const completeIdempotency = async (
    tokenId: string,
    key: string,
    requestHash: string,
    claimNonce: string,
    response: unknown,
    status = 200,
    responseHeaders: Record<string, string> = {},
) => {
    const result = await getDb()
        .update(developerApiIdempotency)
        .set({ status: 'completed', response, responseHeaders, responseStatus: status, completedAt: new Date() })
        .where(
            and(
                eq(developerApiIdempotency.tokenId, tokenId),
                eq(developerApiIdempotency.idempotencyKey, key),
                eq(developerApiIdempotency.requestHash, requestHash),
                eq(developerApiIdempotency.claimNonce, claimNonce),
                eq(developerApiIdempotency.status, 'processing'),
            ),
        )
    if (result[0].affectedRows === 0) throw new ApiError('INTERNAL_ERROR')
}

export const releaseIdempotency = async (tokenId: string, key: string, requestHash: string, claimNonce: string) => {
    await getDb()
        .delete(developerApiIdempotency)
        .where(
            and(
                eq(developerApiIdempotency.tokenId, tokenId),
                eq(developerApiIdempotency.idempotencyKey, key),
                eq(developerApiIdempotency.requestHash, requestHash),
                eq(developerApiIdempotency.claimNonce, claimNonce),
                eq(developerApiIdempotency.status, 'processing'),
            ),
        )
}

/** Remove abandoned claims only after the same retention window used for recovery. */
export const pruneExpiredIdempotency = async () => {
    const cutoff = new Date(Date.now() - PROCESSING_TTL_MS * 2)
    await getDb()
        .delete(developerApiIdempotency)
        .where(and(eq(developerApiIdempotency.status, 'processing'), lt(developerApiIdempotency.claimedAt, cutoff)))
}
