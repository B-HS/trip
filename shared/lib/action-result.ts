import { unstable_rethrow } from 'next/navigation'
import { z } from 'zod'
import {
    API_ERROR_MESSAGE,
    API_ERROR_STATUS,
    type ApiErrorResponse,
    type ApiResponse,
    errorResponse,
    isApiError,
    successResponse,
} from '@/shared/lib/api-response'

export const toErrorResponse = (error: unknown): ApiErrorResponse => {
    if (isApiError(error)) return errorResponse(error.code, error.message)
    if (error instanceof z.ZodError) return errorResponse('VALIDATION_ERROR', error.issues[0]?.message ?? API_ERROR_MESSAGE.VALIDATION_ERROR)
    console.error(error)
    return errorResponse('INTERNAL_ERROR')
}

export const errorResponseStatus = (response: ApiErrorResponse) => API_ERROR_STATUS[response.error.code]

export const runAction = async <T>(handler: () => Promise<T>): Promise<ApiResponse<T>> => {
    try {
        return successResponse(await handler())
    } catch (error) {
        unstable_rethrow(error)
        return toErrorResponse(error)
    }
}

export const unwrapActionResult = <T>(result: ApiResponse<T>) => {
    if (!result.success) throw new Error(result.error.message)
    return result.data
}
