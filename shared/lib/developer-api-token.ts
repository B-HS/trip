import 'server-only'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { and, count, eq, isNull } from 'drizzle-orm'
import {
    API_TOKEN_LABEL_MAX_LENGTH,
    API_TOKEN_MAX_COUNT,
    API_TOKEN_PREFIX,
    API_TOKEN_PREFIX_LENGTH,
    API_TOKEN_RANDOM_BYTES,
    API_TOKEN_SCOPES,
    type ApiTokenScope,
} from '@/shared/constant/developer-api'
import { getDb } from '@/shared/db/client'
import { developerApiToken } from '@/shared/db/schema/developer-api'
import { user } from '@/shared/db/schema/auth'
import { ApiError } from '@/shared/lib/api-response'

export type DeveloperApiToken = typeof developerApiToken.$inferSelect

export type PublicApiToken = Pick<
    DeveloperApiToken,
    'id' | 'tokenPrefix' | 'tokenLast4' | 'label' | 'scopes' | 'expiresAt' | 'lastUsedAt' | 'revokedAt' | 'createdAt'
>

export type IssuedApiToken = PublicApiToken & { token: string }

const base64Url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url')

export const hashApiToken = (token: string) => createHash('sha256').update(token, 'utf8').digest('hex')

export const compareApiTokenHash = (token: string, expectedHash: string) => {
    const actual = Buffer.from(hashApiToken(token), 'hex')
    const expected = Buffer.from(expectedHash, 'hex')
    return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export const createApiTokenValue = () => `${API_TOKEN_PREFIX}${base64Url(randomBytes(API_TOKEN_RANDOM_BYTES))}`

export const tokenMetadata = (token: string) => ({
    tokenPrefix: token.slice(0, API_TOKEN_PREFIX_LENGTH),
    tokenLast4: token.slice(-4),
})

const toPublic = (token: DeveloperApiToken): PublicApiToken => ({
    id: token.id,
    tokenPrefix: token.tokenPrefix,
    tokenLast4: token.tokenLast4,
    label: token.label,
    scopes: token.scopes,
    expiresAt: token.expiresAt,
    lastUsedAt: token.lastUsedAt,
    revokedAt: token.revokedAt,
    createdAt: token.createdAt,
})

export const listDeveloperApiTokens = async (userId: string) => {
    const rows = await getDb().query.developerApiToken.findMany({
        where: (fields, { eq }) => eq(fields.userId, userId),
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    })
    return rows.map(toPublic)
}

const normalizeScopes = (scopes: readonly string[]) => {
    const unique = [...new Set(scopes)]
    if (unique.length === 0 || unique.some((scope) => !(API_TOKEN_SCOPES as readonly string[]).includes(scope))) {
        throw new ApiError('VALIDATION_ERROR', 'error.invalidApiTokenScopes')
    }
    return unique as ApiTokenScope[]
}

export const issueDeveloperApiToken = async (
    userId: string,
    input: { label: string; scopes: readonly string[]; expiresAt?: Date | null },
): Promise<IssuedApiToken> => {
    const label = input.label.trim()
    if (label.length === 0 || label.length > API_TOKEN_LABEL_MAX_LENGTH) throw new ApiError('VALIDATION_ERROR', 'error.invalidApiTokenLabel')
    const scopes = normalizeScopes(input.scopes)
    if (input.expiresAt !== undefined && input.expiresAt !== null && input.expiresAt.getTime() <= Date.now()) {
        throw new ApiError('VALIDATION_ERROR', 'error.invalidApiTokenExpiry')
    }
    const token = createApiTokenValue()
    const metadata = tokenMetadata(token)
    const id = crypto.randomUUID()
    const row = await getDb().transaction(async (tx) => {
        const [owner] = await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
        if (!owner) throw new ApiError('NOT_FOUND', 'error.apiTokenNotFound')
        const [{ activeCount }] = await tx
            .select({ activeCount: count(developerApiToken.id) })
            .from(developerApiToken)
            .where(and(eq(developerApiToken.userId, userId), isNull(developerApiToken.revokedAt)))
        if (activeCount >= API_TOKEN_MAX_COUNT) throw new ApiError('VALIDATION_ERROR', 'error.apiTokenLimit')
        await tx.insert(developerApiToken).values({
            id,
            userId,
            tokenHash: hashApiToken(token),
            ...metadata,
            label,
            scopes,
            expiresAt: input.expiresAt ?? null,
        })
        const [inserted] = await tx.select().from(developerApiToken).where(eq(developerApiToken.id, id)).limit(1)
        return inserted
    })
    if (!row) throw new ApiError('INTERNAL_ERROR')
    return { ...toPublic(row), token }
}

export const revokeDeveloperApiToken = async (userId: string, tokenId: string) => {
    const result = await getDb()
        .update(developerApiToken)
        .set({ revokedAt: new Date() })
        .where(and(eq(developerApiToken.id, tokenId), eq(developerApiToken.userId, userId), isNull(developerApiToken.revokedAt)))
    if (result[0].affectedRows === 0) throw new ApiError('NOT_FOUND', 'error.apiTokenNotFound')
}

export type AuthenticatedDeveloperToken = {
    tokenId: string
    userId: string
    scopes: ApiTokenScope[]
    token: DeveloperApiToken
}

const parseBearer = (request: Request) => {
    const values = request.headers.get('authorization')
    if (values === null || !/^[Bb][Ee][Aa][Rr][Ee][Rr] [^\s]+$/.test(values)) return null
    const [, token] = values.split(' ')
    if (!token.startsWith(API_TOKEN_PREFIX)) return null
    return token
}

export const authenticateDeveloperApiRequest = async (request: Request): Promise<AuthenticatedDeveloperToken | null> => {
    const raw = parseBearer(request)
    if (raw === null) return null
    const row = await getDb().query.developerApiToken.findFirst({ where: (fields, { eq }) => eq(fields.tokenHash, hashApiToken(raw)) })
    if (
        !row ||
        !compareApiTokenHash(raw, row.tokenHash) ||
        row.revokedAt !== null ||
        (row.expiresAt !== null && row.expiresAt.getTime() <= Date.now())
    ) {
        return null
    }
    void getDb()
        .update(developerApiToken)
        .set({ lastUsedAt: new Date() })
        .where(eq(developerApiToken.id, row.id))
        .catch(() => undefined)
    return { tokenId: row.id, userId: row.userId, scopes: row.scopes, token: row }
}

export const requireDeveloperApiRequest = async (request: Request) => {
    const auth = await authenticateDeveloperApiRequest(request)
    if (auth === null) throw new ApiError('UNAUTHORIZED', 'error.invalidApiToken')
    return auth
}

export const assertDeveloperApiScope = (auth: AuthenticatedDeveloperToken, scope: ApiTokenScope) => {
    if (!auth.scopes.includes(scope)) throw new ApiError('FORBIDDEN', 'error.apiTokenScopeRequired')
}
