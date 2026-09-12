export const AUTH_COOKIE_PREFIX = 'trip'
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/

export const USER_ROLES = ['user', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_ROLE_MAX_LENGTH = 32
export const DEFAULT_USER_ROLE = 'user'
export const ADMIN_ROLE = 'admin'

export const SOCIAL_PROVIDERS = ['github', 'naver'] as const
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]
