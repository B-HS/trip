import { NextResponse } from 'next/server'
import { unstable_rethrow } from 'next/navigation'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { checkDeveloperApiRateLimit } from '@/shared/lib/api-rate-limit'
import { requireDeveloperApiRequest, type AuthenticatedDeveloperToken } from '@/shared/lib/developer-api-token'
import { ApiError } from '@/shared/lib/api-response'

export type DeveloperApiContext = { auth: AuthenticatedDeveloperToken; rate: ReturnType<typeof checkDeveloperApiRateLimit> }

export const withDeveloperApi = async <T>(request: Request, handler: (context: DeveloperApiContext) => Promise<T>) => {
    try {
        const auth = await requireDeveloperApiRequest(request)
        const rate = checkDeveloperApiRateLimit(auth.tokenId, request.method)
        const result = await handler({ auth, rate })
        return NextResponse.json({ success: true, data: result }, { headers: rateHeaders(rate) })
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
    try {
        return await request.json()
    } catch {
        throw new ApiError('VALIDATION_ERROR', 'error.invalidJson')
    }
}

export const parsePage = (request: Request) => {
    const url = new URL(request.url)
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('page_size') ?? '20', 10) || 20))
    return { page, pageSize }
}

export const requireIdempotencyKey = (request: Request) => {
    const key = request.headers.get('idempotency-key')?.trim()
    if (key === undefined || key === null || key.length === 0 || key.length > 255) {
        throw new ApiError('VALIDATION_ERROR', 'error.idempotencyKeyRequired')
    }
    return key
}
