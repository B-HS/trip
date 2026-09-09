import { relations } from 'drizzle-orm'
import { boolean, index, text, timestamp, varchar, type AnyMySqlColumn } from 'drizzle-orm/mysql-core'
import { DEFAULT_USER_ROLE, USER_ROLE_MAX_LENGTH } from '@/shared/constant/auth'
import { PROFILE_BANNER_URL_MAX_LENGTH, PROFILE_BIO_MAX_LENGTH } from '@/shared/constant/community'
import { tripUpload } from '@/shared/db/schema/trip'
import { tripTable } from '@/shared/db/table'

export const user = tripTable('user', {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    username: varchar('username', { length: 255 }).unique(),
    displayUsername: text('display_username'),
    image: text('image'),
    role: varchar('role', { length: USER_ROLE_MAX_LENGTH }).default(DEFAULT_USER_ROLE).notNull(),
    banned: boolean('banned').default(false).notNull(),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires', { fsp: 3 }),
    bio: varchar('bio', { length: PROFILE_BIO_MAX_LENGTH }),
    bannerUrl: varchar('banner_url', { length: PROFILE_BANNER_URL_MAX_LENGTH }),
    bannerUploadId: varchar('banner_upload_id', { length: 36 }).references((): AnyMySqlColumn => tripUpload.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
})

export const session = tripTable(
    'session',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
        token: varchar('token', { length: 255 }).notNull().unique(),
        createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        impersonatedBy: varchar('impersonated_by', { length: 36 }),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
    },
    (table) => [index('session_user_id_idx').on(table.userId)],
)

export const account = tripTable(
    'account',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at', { fsp: 3 }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { fsp: 3 }),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('account_user_id_idx').on(table.userId)],
)

export const verification = tripTable(
    'verification',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        identifier: varchar('identifier', { length: 255 }).notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
        createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, { fields: [account.userId], references: [user.id] }),
}))
