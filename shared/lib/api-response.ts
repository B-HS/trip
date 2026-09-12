export const API_ERROR_CODE = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UPLOAD_NOT_CONFIGURED: 'UPLOAD_NOT_CONFIGURED',
    AI_NOT_CONFIGURED: 'AI_NOT_CONFIGURED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',
} as const

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE]

export const API_ERROR_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    UPLOAD_NOT_CONFIGURED: 503,
    AI_NOT_CONFIGURED: 503,
    INTERNAL_ERROR: 500,
    RATE_LIMITED: 429,
} as const satisfies Record<ApiErrorCode, number>

export const API_ERROR_MESSAGE = {
    UNAUTHORIZED: 'error.unauthorized',
    FORBIDDEN: 'error.forbidden',
    NOT_FOUND: 'error.notFound',
    VALIDATION_ERROR: 'error.invalidInput',
    UPLOAD_NOT_CONFIGURED: 'error.uploadNotConfigured',
    AI_NOT_CONFIGURED: 'error.aiNotConfigured',
    INTERNAL_ERROR: 'error.internal',
    RATE_LIMITED: 'error.rateLimited',
} as const satisfies Record<ApiErrorCode, string>

export type ApiSuccessResponse<T> = { success: true; data: T }
export type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string; details?: Record<string, unknown> } }
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => ({ success: true, data })

export const errorResponse = (
    code: ApiErrorCode,
    message: string = API_ERROR_MESSAGE[code],
    details?: Record<string, unknown>,
): ApiErrorResponse => ({
    success: false,
    error: { code, message, ...(details === undefined ? {} : { details }) },
})

export class ApiError extends Error {
    code: ApiErrorCode
    details?: Record<string, unknown>

    constructor(code: ApiErrorCode, message: string = API_ERROR_MESSAGE[code], details?: Record<string, unknown>) {
        super(message)
        this.name = 'ApiError'
        this.code = code
        this.details = details
    }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError
