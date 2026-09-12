import { relations } from 'drizzle-orm'
import { index, json, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
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

export const API_TOKEN_SCOPE_VALUES = API_TOKEN_SCOPES
