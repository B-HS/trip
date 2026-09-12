import { and, eq, sql } from 'drizzle-orm'
import { API_RATE_LIMIT_READ_LIMIT, API_RATE_LIMIT_WINDOW_SECONDS, API_RATE_LIMIT_WRITE_LIMIT } from '@/shared/constant/developer-api'
import { getDb } from '@/shared/db/client'
import { developerApiRateLimit } from '@/shared/db/schema/developer-api'
import { ApiError } from '@/shared/lib/api-response'

export type DeveloperApiRate = { limit: number; remaining: number; reset: number }

export const rateLimitBucket = (method: string) => (method === 'GET' || method === 'HEAD' ? 'read' : 'write') as 'read' | 'write'
export const rateLimitValue = (bucket: 'read' | 'write') => (bucket === 'read' ? API_RATE_LIMIT_READ_LIMIT : API_RATE_LIMIT_WRITE_LIMIT)

/** The row is locked for the increment, so limits are shared across application instances. */
export const checkDeveloperApiRateLimit = async (tokenId: string, method: string): Promise<DeveloperApiRate> => {
    const bucket = rateLimitBucket(method)
    const limit = rateLimitValue(bucket)
    const now = new Date()
    const windowMs = API_RATE_LIMIT_WINDOW_SECONDS * 1000
    return getDb().transaction(async (tx) => {
        // Establish the row atomically before taking the lock. A no-op duplicate
        // update prevents concurrent first requests from resetting an active window.
        await tx
            .insert(developerApiRateLimit)
            .values({ tokenId, bucket, windowStartedAt: now, requestCount: 0 })
            .onDuplicateKeyUpdate({ set: { windowStartedAt: sql`${developerApiRateLimit.windowStartedAt}` } })
        const [row] = await tx
            .select()
            .from(developerApiRateLimit)
            .where(and(eq(developerApiRateLimit.tokenId, tokenId), eq(developerApiRateLimit.bucket, bucket)))
            .limit(1)
            .for('update')
        if (!row || now.getTime() - row.windowStartedAt.getTime() >= windowMs) {
            await tx
                .insert(developerApiRateLimit)
                .values({ tokenId, bucket, windowStartedAt: now, requestCount: 1 })
                .onDuplicateKeyUpdate({ set: { windowStartedAt: now, requestCount: 1, updatedAt: now } })
            return { limit, remaining: limit - 1, reset: Math.ceil((now.getTime() + windowMs) / 1000) }
        }
        if (row.requestCount >= limit) {
            const retryAfter = Math.max(1, Math.ceil((row.windowStartedAt.getTime() + windowMs - now.getTime()) / 1000))
            throw new ApiError('RATE_LIMITED', 'error.rateLimited', {
                retryAfter,
                limit,
                reset: Math.ceil((row.windowStartedAt.getTime() + windowMs) / 1000),
            })
        }
        await tx
            .update(developerApiRateLimit)
            .set({ requestCount: row.requestCount + 1, updatedAt: now })
            .where(and(eq(developerApiRateLimit.tokenId, tokenId), eq(developerApiRateLimit.bucket, bucket)))
        return {
            limit,
            remaining: Math.max(0, limit - row.requestCount - 1),
            reset: Math.ceil((row.windowStartedAt.getTime() + windowMs) / 1000),
        }
    })
}
