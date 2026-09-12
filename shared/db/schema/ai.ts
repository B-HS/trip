import { relations } from 'drizzle-orm'
import { index, int, json, mysqlEnum, primaryKey, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { AI_JOB_KINDS, AI_JOB_STATUSES, AI_MESSAGE_ROLES, AI_PROPOSAL_STATUSES, AI_PROVIDERS, AI_REASONING_EFFORTS } from '@/shared/constant/ai'
import { user } from '@/shared/db/schema/auth'
import { trip } from '@/shared/db/schema/trip'
import { tripTable } from '@/shared/db/table'

const id = () =>
    varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID())
const createdAt = () => timestamp('created_at', { fsp: 3 }).defaultNow().notNull()

export const tripAiKey = tripTable(
    'ai_key',
    {
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        provider: mysqlEnum('provider', AI_PROVIDERS).notNull(),
        ciphertext: text('ciphertext').notNull(),
        iv: varchar('iv', { length: 32 }).notNull(),
        tag: varchar('tag', { length: 32 }).notNull(),
        hint: varchar('hint', { length: 4 }).notNull(),
        createdAt: createdAt(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.provider] }), index('ai_key_provider_idx').on(table.provider)],
)

export const tripAiConversation = tripTable(
    'ai_conversation',
    {
        id: id(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        title: varchar('title', { length: 160 }),
        provider: mysqlEnum('provider', AI_PROVIDERS).notNull(),
        model: varchar('model', { length: 160 }).notNull(),
        reasoningEffort: mysqlEnum('reasoning_effort', AI_REASONING_EFFORTS),
        createdAt: createdAt(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('ai_conversation_user_id_idx').on(table.userId), index('ai_conversation_trip_id_idx').on(table.tripId)],
)

export const tripAiMessage = tripTable(
    'ai_message',
    {
        id: id(),
        conversationId: varchar('conversation_id', { length: 36 })
            .notNull()
            .references(() => tripAiConversation.id, { onDelete: 'cascade' }),
        role: mysqlEnum('role', AI_MESSAGE_ROLES).notNull(),
        content: text('content').notNull(),
        provider: mysqlEnum('provider', AI_PROVIDERS),
        model: varchar('model', { length: 160 }),
        inputTokens: int('input_tokens'),
        outputTokens: int('output_tokens'),
        // Deliberately no FK: this nullable output marker is inserted with the
        // job's assistant message and is protected by a unique index. Keeping
        // the dependency one-way avoids a circular Drizzle relation initializer.
        jobId: varchar('job_id', { length: 36 }),
        createdAt: createdAt(),
    },
    (table) => [index('ai_message_conversation_id_idx').on(table.conversationId), uniqueIndex('ai_message_job_idx').on(table.jobId)],
)

export const tripAiJob = tripTable(
    'ai_job',
    {
        id: id(),
        conversationId: varchar('conversation_id', { length: 36 })
            .notNull()
            .references(() => tripAiConversation.id, { onDelete: 'cascade' }),
        userMessageId: varchar('user_message_id', { length: 36 })
            .notNull()
            .references(() => tripAiMessage.id, { onDelete: 'cascade' }),
        kind: mysqlEnum('kind', AI_JOB_KINDS).notNull(),
        status: mysqlEnum('status', AI_JOB_STATUSES).notNull().default('queued'),
        attempts: int('attempts').notNull().default(0),
        error: varchar('error', { length: 500 }),
        proposal: json('proposal'),
        leaseId: varchar('lease_id', { length: 36 }),
        leaseExpiresAt: timestamp('lease_expires_at', { fsp: 3 }),
        completedAt: timestamp('completed_at', { fsp: 3 }),
        createdAt: createdAt(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('ai_job_conversation_id_idx').on(table.conversationId), index('ai_job_status_idx').on(table.status)],
)

export const tripAiDispatch = tripTable(
    'ai_dispatch',
    {
        jobId: varchar('job_id', { length: 36 })
            .primaryKey()
            .references(() => tripAiJob.id, { onDelete: 'cascade' }),
        status: mysqlEnum('status', ['queued', 'sending', 'sent', 'failed'] as const)
            .notNull()
            .default('queued'),
        attempts: int('attempts').notNull().default(0),
        leaseId: varchar('lease_id', { length: 36 }),
        leaseExpiresAt: timestamp('lease_expires_at', { fsp: 3 }),
        nextAttemptAt: timestamp('next_attempt_at', { fsp: 3 }),
        lastError: varchar('last_error', { length: 500 }),
        lastAttemptAt: timestamp('last_attempt_at', { fsp: 3 }),
        createdAt: createdAt(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('ai_dispatch_status_idx').on(table.status, table.nextAttemptAt)],
)

export const tripAiUsage = tripTable(
    'ai_usage',
    {
        id: id(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        conversationId: varchar('conversation_id', { length: 36 }).references(() => tripAiConversation.id, { onDelete: 'set null' }),
        jobId: varchar('job_id', { length: 36 }).references(() => tripAiJob.id, { onDelete: 'set null' }),
        provider: mysqlEnum('provider', AI_PROVIDERS).notNull(),
        model: varchar('model', { length: 160 }).notNull(),
        inputTokens: int('input_tokens').notNull().default(0),
        outputTokens: int('output_tokens').notNull().default(0),
        createdAt: createdAt(),
    },
    (table) => [index('ai_usage_user_created_at_idx').on(table.userId, table.createdAt), uniqueIndex('ai_usage_job_idx').on(table.jobId)],
)

export const tripAiProposal = tripTable(
    'ai_proposal',
    {
        id: id(),
        jobId: varchar('job_id', { length: 36 })
            .notNull()
            .references(() => tripAiJob.id, { onDelete: 'cascade' }),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        status: mysqlEnum('status', AI_PROPOSAL_STATUSES).notNull().default('pending'),
        changes: json('changes').notNull(),
        baseTripRevision: int('base_trip_revision'),
        baseTripUpdatedAt: timestamp('base_trip_updated_at', { fsp: 3 }),
        leaseId: varchar('lease_id', { length: 36 }),
        leaseExpiresAt: timestamp('lease_expires_at', { fsp: 3 }),
        createdAt: createdAt(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [uniqueIndex('ai_proposal_job_idx').on(table.jobId), index('ai_proposal_trip_id_idx').on(table.tripId)],
)

export const tripAiKeyRelations = relations(tripAiKey, ({ one }) => ({ user: one(user, { fields: [tripAiKey.userId], references: [user.id] }) }))
export const tripAiConversationRelations = relations(tripAiConversation, ({ one, many }) => ({
    user: one(user, { fields: [tripAiConversation.userId], references: [user.id] }),
    trip: one(trip, { fields: [tripAiConversation.tripId], references: [trip.id] }),
    messages: many(tripAiMessage),
    jobs: many(tripAiJob),
}))
export const tripAiMessageRelations = relations(tripAiMessage, ({ one, many }) => ({
    conversation: one(tripAiConversation, { fields: [tripAiMessage.conversationId], references: [tripAiConversation.id] }),
    jobs: many(tripAiJob),
}))
export const tripAiJobRelations = relations(tripAiJob, ({ one }) => ({
    conversation: one(tripAiConversation, { fields: [tripAiJob.conversationId], references: [tripAiConversation.id] }),
    userMessage: one(tripAiMessage, { fields: [tripAiJob.userMessageId], references: [tripAiMessage.id] }),
    proposal: one(tripAiProposal),
}))
export const tripAiUsageRelations = relations(tripAiUsage, ({ one }) => ({
    user: one(user, { fields: [tripAiUsage.userId], references: [user.id] }),
    conversation: one(tripAiConversation, { fields: [tripAiUsage.conversationId], references: [tripAiConversation.id] }),
    job: one(tripAiJob, { fields: [tripAiUsage.jobId], references: [tripAiJob.id] }),
}))
export const tripAiProposalRelations = relations(tripAiProposal, ({ one }) => ({
    job: one(tripAiJob, { fields: [tripAiProposal.jobId], references: [tripAiJob.id] }),
    trip: one(trip, { fields: [tripAiProposal.tripId], references: [trip.id] }),
}))
