import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/shared/constant/auth'

export const AUTH_ERROR_FALLBACK_MESSAGE = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

export const AUTH_ERROR_MESSAGE = {
    USER_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: '이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요.',
    USER_NOT_FOUND: '계정을 찾을 수 없습니다.',
    INVALID_EMAIL: '이메일 형식이 올바르지 않습니다.',
    INVALID_EMAIL_OR_PASSWORD: '이메일 또는 비밀번호가 올바르지 않습니다.',
    INVALID_USERNAME_OR_PASSWORD: '사용자명 또는 비밀번호가 올바르지 않습니다.',
    INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
    INVALID_USER: '계정 정보가 올바르지 않습니다.',
    PASSWORD_TOO_SHORT: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
    PASSWORD_TOO_LONG: `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`,
    USERNAME_IS_ALREADY_TAKEN: '이미 사용 중인 사용자명입니다. 다른 사용자명을 입력해 주세요.',
    USERNAME_TOO_SHORT: `사용자명은 ${USERNAME_MIN_LENGTH}자 이상이어야 합니다.`,
    USERNAME_TOO_LONG: `사용자명은 ${USERNAME_MAX_LENGTH}자 이하여야 합니다.`,
    INVALID_USERNAME: '사용자명에 사용할 수 없는 문자가 있습니다.',
    INVALID_DISPLAY_USERNAME: '표시용 사용자명 형식이 올바르지 않습니다.',
    USERNAME_IS_IMMUTABLE: '사용자명은 변경할 수 없습니다.',
    CREDENTIAL_ACCOUNT_NOT_FOUND: '비밀번호로 로그인할 수 없는 계정입니다.',
    EMAIL_NOT_VERIFIED: '이메일 인증이 필요합니다.',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해 주세요.',
    FAILED_TO_CREATE_USER: '계정을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.',
    FAILED_TO_CREATE_SESSION: '로그인 세션을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.',
    VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
    MISSING_FIELD: '필수 입력값이 비어 있습니다.',
    UNEXPECTED_ERROR: AUTH_ERROR_FALLBACK_MESSAGE,
} as const

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGE

const isAuthErrorCode = (code: string): code is AuthErrorCode => Object.hasOwn(AUTH_ERROR_MESSAGE, code)

export const getAuthErrorMessage = (code?: string | null) => (code && isAuthErrorCode(code) ? AUTH_ERROR_MESSAGE[code] : AUTH_ERROR_FALLBACK_MESSAGE)
