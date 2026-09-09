import { ApiError, type ApiResponse } from '@/shared/lib/api-response'

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
    typeof value === 'object' && value !== null && 'success' in value && typeof value.success === 'boolean'

export const clientFetch = async <T>(path: string, init?: RequestInit) => {
    const isMultipart = init?.body instanceof FormData
    const response = await fetch(path, { ...init, headers: isMultipart ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers } })
    const body: unknown = await response.json()
    if (!isApiResponse(body)) throw new ApiError('INTERNAL_ERROR')
    if (!body.success) throw new ApiError(body.error.code, body.error.message)
    return body.data as T
}
