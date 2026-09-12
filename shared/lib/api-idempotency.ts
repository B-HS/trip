import { createHash } from 'node:crypto'
import { ApiError } from '@/shared/lib/api-response'

type CachedResponse = { requestHash: string; response: unknown; status: number; expiresAt: number }
const records = new Map<string, CachedResponse>()
const TTL_MS = 24 * 60 * 60 * 1000

export const requestFingerprint = async (request: Request, body: unknown) => {
    const raw = JSON.stringify({ method: request.method, path: new URL(request.url).pathname, body })
    return createHash('sha256').update(raw).digest('hex')
}

export const readIdempotentResponse = (tokenId: string, key: string, requestHash: string) => {
    const record = records.get(`${tokenId}:${key}`)
    if (!record || record.expiresAt <= Date.now()) {
        if (record) records.delete(`${tokenId}:${key}`)
        return null
    }
    if (record.requestHash !== requestHash) throw new ApiError('VALIDATION_ERROR', 'error.idempotencyKeyConflict')
    return record
}

export const writeIdempotentResponse = (tokenId: string, key: string, requestHash: string, response: unknown, status = 200) => {
    records.set(`${tokenId}:${key}`, { requestHash, response, status, expiresAt: Date.now() + TTL_MS })
}

export const clearApiIdempotency = () => records.clear()
