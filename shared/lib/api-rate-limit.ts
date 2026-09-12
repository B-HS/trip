import { API_RATE_LIMIT_READ_LIMIT, API_RATE_LIMIT_WINDOW_SECONDS, API_RATE_LIMIT_WRITE_LIMIT } from '@/shared/constant/developer-api'
import { ApiError } from '@/shared/lib/api-response'

type Bucket = { timestamps: number[] }
const buckets = new Map<string, Bucket>()

export const checkDeveloperApiRateLimit = (tokenId: string, method: string) => {
    const now = Date.now()
    const windowStart = now - API_RATE_LIMIT_WINDOW_SECONDS * 1000
    const key = `${tokenId}:${method === 'GET' || method === 'HEAD' ? 'read' : 'write'}`
    const bucket = buckets.get(key) ?? { timestamps: [] }
    bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > windowStart)
    const limit = method === 'GET' || method === 'HEAD' ? API_RATE_LIMIT_READ_LIMIT : API_RATE_LIMIT_WRITE_LIMIT
    if (bucket.timestamps.length >= limit) {
        const retryAfter = Math.max(1, Math.ceil((bucket.timestamps[0] + API_RATE_LIMIT_WINDOW_SECONDS * 1000 - now) / 1000))
        throw new ApiError('RATE_LIMITED', 'error.rateLimited', { retryAfter, limit, reset: Math.ceil((now + retryAfter * 1000) / 1000) })
    }
    bucket.timestamps.push(now)
    buckets.set(key, bucket)
    return {
        limit,
        remaining: Math.max(0, limit - bucket.timestamps.length),
        reset: Math.ceil((now + API_RATE_LIMIT_WINDOW_SECONDS * 1000) / 1000),
    }
}

export const clearDeveloperApiRateLimit = () => buckets.clear()
