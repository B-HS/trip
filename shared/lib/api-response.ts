export const API_ERROR_CODE = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE]

export const API_ERROR_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    INTERNAL_ERROR: 500,
} as const satisfies Record<ApiErrorCode, number>

export const API_ERROR_MESSAGE = {
    UNAUTHORIZED: '로그인이 필요합니다.',
    FORBIDDEN: '접근 권한이 없습니다.',
    NOT_FOUND: '찾을 수 없습니다.',
    VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
    INTERNAL_ERROR: '처리 중 오류가 발생했습니다.',
} as const satisfies Record<ApiErrorCode, string>

export type ApiSuccessResponse<T> = { success: true; data: T }
export type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string } }
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => ({ success: true, data })

export const errorResponse = (code: ApiErrorCode, message: string = API_ERROR_MESSAGE[code]): ApiErrorResponse => ({
    success: false,
    error: { code, message },
})

export class ApiError extends Error {
    code: ApiErrorCode

    constructor(code: ApiErrorCode, message: string = API_ERROR_MESSAGE[code]) {
        super(message)
        this.name = 'ApiError'
        this.code = code
    }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError
