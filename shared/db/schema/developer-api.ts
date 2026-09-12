import { relations } from 'drizzle-orm'
import { foreignKey, index, int, json, mysqlEnum, primaryKey, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { user } from '@/shared/db/schema/auth'
import { API_TOKEN_SCOPES, type ApiTokenScope } from '@/shared/constant/developer-api'
import { tripTable } from '@/shared/db/table'

export const developerApiToken = tripTable(
    'developer_api_token',
    {
        id: varchar('id', { length: 36 })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        tokenHash: varchar('token_hash', { length: 64 }).notNull(),
        tokenPrefix: varchar('token_prefix', { length: 32 }).notNull(),
        tokenLast4: varchar('token_last4', { length: 4 }).notNull(),
        label: varchar('label', { length: 80 }).notNull(),
        scopes: json('scopes').$type<ApiTokenScope[]>().notNull(),
        expiresAt: timestamp('expires_at', { fsp: 3 }),
        lastUsedAt: timestamp('last_used_at', { fsp: 3 }),
        revokedAt: timestamp('revoked_at', { fsp: 3 }),
        createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('developer_api_token_hash_idx').on(table.tokenHash),
        index('developer_api_token_user_id_idx').on(table.userId),
        index('developer_api_token_active_idx').on(table.userId, table.revokedAt),
    ],
)

export const developerApiTokenRelations = relations(developerApiToken, ({ one }) => ({
    user: one(user, { fields: [developerApiToken.userId], references: [user.id] }),
}))

export const developerApiIdempotency = tripTable(
    'developer_api_idempotency',
    {
        tokenId: varchar('token_id', { length: 36 }).notNull(),
        idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
        requestHash: varchar('request_hash', { length: 64 }).notNull(),
        status: mysqlEnum('status', ['processing', 'completed'] as const)
            .notNull()
            .default('processing'),
        claimNonce: varchar('claim_nonce', { length: 36 }).notNull(),
        response: json('response'),
        responseStatus: int('response_status'),
        responseHeaders: json('response_headers').$type<Record<string, string>>(),
        claimedAt: timestamp('claimed_at', { fsp: 3 }).defaultNow().notNull(),
        completedAt: timestamp('completed_at', { fsp: 3 }),
    },
    (table) => [
        primaryKey({ columns: [table.tokenId, table.idempotencyKey] }),
        foreignKey({
            columns: [table.tokenId],
            foreignColumns: [developerApiToken.id],
            name: 'developer_api_idempotency_token_fk',
        }).onDelete('cascade'),
        index('developer_api_idempotency_claimed_idx').on(table.claimedAt),
        index('developer_api_idempotency_completed_idx').on(table.completedAt),
    ],
)

export const developerApiRateLimit = tripTable(
    'developer_api_rate_limit',
    {
        tokenId: varchar('token_id', { length: 36 }).notNull(),
        bucket: mysqlEnum('bucket', ['read', 'write'] as const).notNull(),
        windowStartedAt: timestamp('window_started_at', { fsp: 3 }).notNull(),
        requestCount: int('request_count').notNull().default(0),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.tokenId, table.bucket] }),
        foreignKey({
            columns: [table.tokenId],
            foreignColumns: [developerApiToken.id],
            name: 'developer_api_rate_limit_token_fk',
        }).onDelete('cascade'),
        index('developer_api_rate_limit_window_idx').on(table.windowStartedAt),
    ],
)

export const API_TOKEN_SCOPE_VALUES = API_TOKEN_SCOPES
