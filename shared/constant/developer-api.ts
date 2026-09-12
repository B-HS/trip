export const API_TOKEN_PREFIX = 'trip_pat_'
export const API_TOKEN_RANDOM_BYTES = 32
export const API_TOKEN_PREFIX_LENGTH = API_TOKEN_PREFIX.length + 8
export const API_TOKEN_LABEL_MAX_LENGTH = 80
export const API_TOKEN_MAX_COUNT = 20
export const API_TOKEN_DEFAULT_TTL_DAYS = 365

export const API_TOKEN_SCOPES = ['trips:read', 'trips:write', 'token:inspect'] as const
export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number]

export const API_TOKEN_READ_SCOPES = ['trips:read', 'token:inspect'] as const satisfies readonly ApiTokenScope[]
export const API_TOKEN_WRITE_SCOPES = ['trips:write'] as const satisfies readonly ApiTokenScope[]

export const API_RATE_LIMIT_WINDOW_SECONDS = 60
export const API_RATE_LIMIT_READ_LIMIT = 60
export const API_RATE_LIMIT_WRITE_LIMIT = 20
export const API_PAGE_SIZE_DEFAULT = 20
export const API_PAGE_SIZE_MAX = 100

export const hasApiTokenScope = (scopes: readonly ApiTokenScope[], required: ApiTokenScope) => scopes.includes(required)
