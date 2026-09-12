import { NextResponse } from 'next/server'
import { unstable_rethrow } from 'next/navigation'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { checkDeveloperApiRateLimit } from '@/shared/lib/api-rate-limit'
import { requireDeveloperApiRequest, type AuthenticatedDeveloperToken } from '@/shared/lib/developer-api-token'
import { ApiError } from '@/shared/lib/api-response'
import { createHash } from 'node:crypto'

export const API_REQUEST_BODY_MAX_BYTES = 1_000_000
const API_PAGE_MAX = 1_000_000

const responseMeta = Symbol('developer-api-response')
type DeveloperApiResult<T> = { [responseMeta]: true; data: T; status: number; headers?: Record<string, string> }

export const developerApiResponse = <T>(data: T, options: { status?: number; headers?: Record<string, string> } = {}): DeveloperApiResult<T> => ({
    [responseMeta]: true,
    data,
    status: options.status ?? 200,
    headers: options.headers,
})

export type DeveloperApiContext = { auth: AuthenticatedDeveloperToken; rate: Awaited<ReturnType<typeof checkDeveloperApiRateLimit>> }

export const withDeveloperApi = async <T>(request: Request, handler: (context: DeveloperApiContext) => Promise<T>) => {
    try {
        const auth = await requireDeveloperApiRequest(request)
        const rate = await checkDeveloperApiRateLimit(auth.tokenId, request.method)
        const result = await handler({ auth, rate })
        const meta = result && typeof result === 'object' && responseMeta in result ? (result as unknown as DeveloperApiResult<unknown>) : null
        return NextResponse.json(
            { success: true, data: meta ? meta.data : result },
            { status: meta?.status ?? 200, headers: { ...rateHeaders(rate), ...(meta?.headers ?? {}) } },
        )
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        const details = body.error.details
        const headers =
            details && typeof details.reset === 'number'
                ? {
                      ...rateHeaders({ limit: Number(details.limit ?? 0), remaining: 0, reset: details.reset }),
                      ...(typeof details.retryAfter === 'number' ? { 'Retry-After': String(details.retryAfter) } : {}),
                  }
                : undefined
        return NextResponse.json(body, { status: errorResponseStatus(body), headers })
    }
}

export const rateHeaders = (rate: { limit: number; remaining: number; reset: number }) => ({
    'X-RateLimit-Limit': String(rate.limit),
    'X-RateLimit-Remaining': String(rate.remaining),
    'X-RateLimit-Reset': String(rate.reset),
})

export const parseJson = async (request: Request) => {
    const contentLength = request.headers.get('content-length')
    const declaredLength = contentLength === null ? null : Number(contentLength)
    if (declaredLength !== null && Number.isFinite(declaredLength) && declaredLength > API_REQUEST_BODY_MAX_BYTES)
        throw new ApiError('PAYLOAD_TOO_LARGE', 'error.requestTooLarge')

    const body = request.body
    if (body === null) throw new ApiError('VALIDATION_ERROR', 'error.invalidJson')

    const reader = body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value === undefined) continue
            total += value.byteLength
            if (total > API_REQUEST_BODY_MAX_BYTES) {
                try {
                    await reader.cancel()
                } catch {
                    // The request is already rejected; cancellation is best effort.
                }
                throw new ApiError('PAYLOAD_TOO_LARGE', 'error.requestTooLarge')
            }
            chunks.push(value)
        }
    } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError('VALIDATION_ERROR', 'error.invalidJson')
    } finally {
        reader.releaseLock()
    }

    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
        bytes.set(chunk, offset)
        offset += chunk.byteLength
    }
    const raw = new TextDecoder().decode(bytes)
    try {
        return JSON.parse(raw) as unknown
    } catch {
        throw new ApiError('VALIDATION_ERROR', 'error.invalidJson')
    }
}

export const parsePage = (request: Request) => {
    const url = new URL(request.url)
    const parse = (name: string, fallback: number, max: number) => {
        const value = url.searchParams.get(name)
        if (value === null) return fallback
        if (!/^[1-9]\d*$/.test(value)) throw new ApiError('VALIDATION_ERROR', 'error.invalidPagination')
        const parsed = Number(value)
        if (!Number.isSafeInteger(parsed) || parsed > max) throw new ApiError('VALIDATION_ERROR', 'error.invalidPagination')
        return parsed
    }
    const page = parse('page', 1, API_PAGE_MAX)
    const pageSize = parse('page_size', 20, 100)
    return { page, pageSize }
}

export const requireIdempotencyKey = (request: Request) => {
    const key = request.headers.get('idempotency-key')?.trim()
    if (key === undefined || key === null || key.length === 0 || key.length > 255) {
        throw new ApiError('VALIDATION_ERROR', 'error.idempotencyKeyRequired')
    }
    return key
}

export const requireConfirmation = (request: Request, expected: 'replace' | 'delete') => {
    if (request.headers.get('x-trip-confirm')?.trim().toLowerCase() !== expected) throw new ApiError('VALIDATION_ERROR', 'error.confirmationRequired')
}

export const etagForUpdatedAt = (updatedAt: Date | string) => {
    const value = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt
    return `"${createHash('sha256').update(value).digest('base64url')}"`
}

export const etagForRevision = (revision: number) => `"${createHash('sha256').update(`revision:${revision}`).digest('base64url')}"`

export const requireIfMatch = (request: Request, expected: Date | string | number) => {
    const value = request.headers.get('if-match')
    if (!value) throw new ApiError('PRECONDITION_REQUIRED', 'error.ifMatchRequired')
    const expectedTag = typeof expected === 'number' ? etagForRevision(expected) : etagForUpdatedAt(expected)
    if (value !== expectedTag) throw new ApiError('PRECONDITION_FAILED', 'error.staleResource')
}
