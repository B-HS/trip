import 'server-only'
import { and, asc, desc, eq, gte, inArray } from 'drizzle-orm'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripDetail } from '@/entities/trip/trip.repository'
import { saveDay } from '@/entities/trip/trip.repository.days'
import { dayInputSchema } from '@/entities/trip/trip.validate'
import { listProviderModels, generateProviderText } from '@/entities/ai/ai.provider'
import type { AiKeyStatus, AiModel, AiProposalChange } from '@/entities/ai/ai.types'
import { AI_MAX_ERROR_LENGTH, AI_MODEL_CACHE_TTL_MS, type AiJobKind, type AiProvider, type AiReasoningEffort } from '@/shared/constant/ai'
import { getDb } from '@/shared/db/client'
import { tripAiConversation, tripAiJob, tripAiKey, tripAiMessage, tripAiProposal, tripAiUsage } from '@/shared/db/schema/ai'
import { decryptSecret, encryptSecret } from '@/shared/lib/crypto'
import { ApiError } from '@/shared/lib/api-response'

type ModelCacheEntry = { expiresAt: number; models: AiModel[] }
const modelCache = new Map<string, ModelCacheEntry>()

const getKey = async (userId: string, provider: AiProvider) => {
    const row = await getDb()
        .select()
        .from(tripAiKey)
        .where(and(eq(tripAiKey.userId, userId), eq(tripAiKey.provider, provider)))
        .limit(1)
    if (!row[0]) throw new ApiError('FORBIDDEN', 'error.aiKeyRequired')
    return decryptSecret(row[0])
}

export const listAiKeys = async (userId: string): Promise<AiKeyStatus[]> => {
    const rows = await getDb()
        .select({ provider: tripAiKey.provider, hint: tripAiKey.hint, createdAt: tripAiKey.createdAt })
        .from(tripAiKey)
        .where(eq(tripAiKey.userId, userId))
    return rows
}

export const saveAiKey = async (userId: string, provider: AiProvider, secret: string) => {
    const encrypted = encryptSecret(secret)
    const db = getDb()
    await db
        .insert(tripAiKey)
        .values({ userId, provider, ciphertext: encrypted.ciphertext, iv: encrypted.iv, tag: encrypted.tag, hint: encrypted.hint })
        .onDuplicateKeyUpdate({
            set: { ciphertext: encrypted.ciphertext, iv: encrypted.iv, tag: encrypted.tag, hint: encrypted.hint, updatedAt: new Date() },
        })
    modelCache.delete(`${userId}:${provider}`)
}

export const deleteAiKey = async (userId: string, provider: AiProvider) => {
    await getDb()
        .delete(tripAiKey)
        .where(and(eq(tripAiKey.userId, userId), eq(tripAiKey.provider, provider)))
    modelCache.delete(`${userId}:${provider}`)
}

export const listAiModels = async (userId: string, provider: AiProvider, refresh = false) => {
    const cacheKey = `${userId}:${provider}`
    const cached = modelCache.get(cacheKey)
    if (!refresh && cached && cached.expiresAt > Date.now()) return cached.models
    const models = await listProviderModels(provider, await getKey(userId, provider))
    modelCache.set(cacheKey, { models, expiresAt: Date.now() + AI_MODEL_CACHE_TTL_MS })
    return models
}

type NewJob = {
    tripId: string
    conversationId?: string
    provider: AiProvider
    model: string
    reasoningEffort?: AiReasoningEffort | null
    prompt: string
    kind: AiJobKind
}

export const createAiJob = async (userId: string, input: NewJob) => {
    await assertTripAccess(input.tripId, userId, 'view')
    const models = await listAiModels(userId, input.provider)
    const selected = models.find((model) => model.id === input.model)
    if (!selected) throw new ApiError('VALIDATION_ERROR', 'error.aiModelNotFound')
    if (input.reasoningEffort && !selected.reasoningEfforts.includes(input.reasoningEffort))
        throw new ApiError('VALIDATION_ERROR', 'error.aiReasoningUnsupported')
    const conversationId = input.conversationId ?? crypto.randomUUID()
    const messageId = crypto.randomUUID()
    const jobId = crypto.randomUUID()
    const db = getDb()
    await db.transaction(async (tx) => {
        if (!input.conversationId)
            await tx.insert(tripAiConversation).values({
                id: conversationId,
                userId,
                tripId: input.tripId,
                provider: input.provider,
                model: input.model,
                reasoningEffort: input.reasoningEffort ?? null,
            })
        else {
            const existing = await tx
                .select({ id: tripAiConversation.id, userId: tripAiConversation.userId, tripId: tripAiConversation.tripId })
                .from(tripAiConversation)
                .where(eq(tripAiConversation.id, conversationId))
                .limit(1)
            if (!existing[0] || existing[0].userId !== userId || existing[0].tripId !== input.tripId)
                throw new ApiError('NOT_FOUND', 'error.aiConversationNotFound')
        }
        await tx.insert(tripAiMessage).values({ id: messageId, conversationId, role: 'user', content: input.prompt })
        await tx.insert(tripAiJob).values({ id: jobId, conversationId, userMessageId: messageId, kind: input.kind, status: 'queued', attempts: 0 })
    })
    return { jobId, conversationId, messageId }
}

export const getAiConversation = async (userId: string, conversationId: string) => {
    const conversation = await getDb().query.tripAiConversation.findFirst({
        where: (fields, operators) => and(operators.eq(fields.id, conversationId), operators.eq(fields.userId, userId)),
    })
    if (!conversation) throw new ApiError('NOT_FOUND', 'error.aiConversationNotFound')
    const messages = await getDb()
        .select()
        .from(tripAiMessage)
        .where(eq(tripAiMessage.conversationId, conversationId))
        .orderBy(asc(tripAiMessage.createdAt))
    const jobs = await getDb().select().from(tripAiJob).where(eq(tripAiJob.conversationId, conversationId)).orderBy(desc(tripAiJob.createdAt))
    const proposalRows = jobs.length
        ? await getDb()
              .select()
              .from(tripAiProposal)
              .where(
                  inArray(
                      tripAiProposal.jobId,
                      jobs.map((job) => job.id),
                  ),
              )
        : []
    return {
        conversation,
        messages,
        jobs: jobs.map((job) => ({ ...job, proposalId: proposalRows.find((proposal) => proposal.jobId === job.id)?.id ?? null })),
        proposals: proposalRows,
    }
}

export const getAiJob = async (userId: string, jobId: string) => {
    const row = await getDb()
        .select({ job: tripAiJob, conversation: tripAiConversation })
        .from(tripAiJob)
        .innerJoin(tripAiConversation, eq(tripAiJob.conversationId, tripAiConversation.id))
        .where(and(eq(tripAiJob.id, jobId), eq(tripAiConversation.userId, userId)))
        .limit(1)
    if (!row[0]) throw new ApiError('NOT_FOUND', 'error.aiJobNotFound')
    const proposal = await getDb().select().from(tripAiProposal).where(eq(tripAiProposal.jobId, jobId)).limit(1)
    return { ...row[0].job, conversation: row[0].conversation, proposal: proposal[0] ?? null }
}

const compactTripContext = async (tripId: string) => {
    const trip = await findTripDetail(tripId)
    if (!trip) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
    return {
        title: trip.title,
        destination: trip.destination,
        dates: [trip.startDate, trip.endDate],
        days: trip.days.map((day) => ({
            dayIndex: day.dayIndex,
            date: day.date,
            title: day.title,
            items: day.scheduleItems.map((item) => ({ id: item.id, time: item.timeLabel, title: item.title, note: item.note, kindId: item.kindId })),
        })),
        bookings: trip.bookings.map((booking) => ({ title: booking.title, when: booking.whenLabel, status: booking.planStatus })),
    }
}

const extractJson = (text: string) => {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end < start) throw new Error('AI proposal response was not valid JSON')
    return JSON.parse(text.slice(start, end + 1)) as unknown
}

const proposalChanges = (value: unknown): AiProposalChange[] => {
    if (!value || typeof value !== 'object') throw new Error('AI proposal response was not valid')
    const changes = (value as { changes?: unknown }).changes
    if (!Array.isArray(changes) || changes.length > 100) throw new Error('AI proposal changes were not valid')
    return changes.map((change) => {
        if (!change || typeof change !== 'object') throw new Error('AI proposal change was not valid')
        const item = change as Record<string, unknown>
        if (!['add', 'update', 'delete'].includes(String(item.operation)) || !Number.isInteger(item.dayIndex) || Number(item.dayIndex) < 0)
            throw new Error('AI proposal change was not valid')
        return {
            operation: item.operation as AiProposalChange['operation'],
            dayIndex: Number(item.dayIndex),
            itemId: typeof item.itemId === 'string' ? item.itemId : undefined,
            timeLabel: typeof item.timeLabel === 'string' ? item.timeLabel.slice(0, 40) : undefined,
            title: typeof item.title === 'string' ? item.title.slice(0, 200) : undefined,
            note: typeof item.note === 'string' ? item.note.slice(0, 300) : item.note === null ? null : undefined,
            kindId: typeof item.kindId === 'string' ? item.kindId : undefined,
        }
    })
}

export const processAiJob = async (jobId: string) => {
    const row = await getDb()
        .select({ job: tripAiJob, conversation: tripAiConversation })
        .from(tripAiJob)
        .innerJoin(tripAiConversation, eq(tripAiJob.conversationId, tripAiConversation.id))
        .where(eq(tripAiJob.id, jobId))
        .limit(1)
    if (!row[0]) throw new Error('AI job not found')
    const { job, conversation } = row[0]
    if (job.status === 'done') return
    await getDb()
        .update(tripAiJob)
        .set({ status: 'running', attempts: job.attempts + 1, error: null })
        .where(eq(tripAiJob.id, jobId))
    try {
        const messages = await getDb()
            .select({ role: tripAiMessage.role, content: tripAiMessage.content })
            .from(tripAiMessage)
            .where(eq(tripAiMessage.conversationId, conversation.id))
            .orderBy(asc(tripAiMessage.createdAt))
        const context = await compactTripContext(conversation.tripId)
        const userPrompt = messages.filter((message) => message.role === 'user').at(-1)?.content ?? ''
        const system =
            job.kind === 'proposal'
                ? 'You are a travel itinerary editor. Return JSON only: {"changes":[{"operation":"add|update|delete","dayIndex":0,"itemId":"optional","timeLabel":"optional","title":"optional","note":"optional","kindId":"optional"}]}. Never invent item ids or kind ids. Propose only changes requested by the user.'
                : 'You answer questions about the provided trip context. Do not claim facts that are not in the context. Keep the answer concise.'
        const prompt = `${system}\nTrip context:\n${JSON.stringify(context)}\nConversation:\n${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}\nUser request: ${userPrompt}`
        const result = await generateProviderText(
            conversation.provider,
            await getKey(conversation.userId, conversation.provider),
            conversation.model,
            prompt,
            conversation.reasoningEffort,
        )
        const db = getDb()
        const assistantId = crypto.randomUUID()
        await db.transaction(async (tx) => {
            await tx.insert(tripAiMessage).values({
                id: assistantId,
                conversationId: conversation.id,
                role: 'assistant',
                content: result.text,
                provider: conversation.provider,
                model: conversation.model,
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
            })
            await tx.insert(tripAiUsage).values({
                id: crypto.randomUUID(),
                userId: conversation.userId,
                conversationId: conversation.id,
                jobId,
                provider: conversation.provider,
                model: conversation.model,
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
            })
            if (job.kind === 'proposal') {
                const changes = proposalChanges(extractJson(result.text))
                const proposalId = crypto.randomUUID()
                await tx.insert(tripAiProposal).values({ id: proposalId, jobId, tripId: conversation.tripId, status: 'pending', changes })
                await tx.update(tripAiJob).set({ status: 'done', proposal: changes }).where(eq(tripAiJob.id, jobId))
            } else await tx.update(tripAiJob).set({ status: 'done' }).where(eq(tripAiJob.id, jobId))
        })
    } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, AI_MAX_ERROR_LENGTH) : 'AI job failed'
        await getDb().update(tripAiJob).set({ status: 'failed', error: message }).where(eq(tripAiJob.id, jobId))
        throw error
    }
}

export const decideAiProposal = async (userId: string, proposalId: string, decision: 'approve' | 'reject') => {
    const rows = await getDb()
        .select({ proposal: tripAiProposal, conversation: tripAiConversation })
        .from(tripAiProposal)
        .innerJoin(tripAiJob, eq(tripAiProposal.jobId, tripAiJob.id))
        .innerJoin(tripAiConversation, eq(tripAiJob.conversationId, tripAiConversation.id))
        .where(and(eq(tripAiProposal.id, proposalId), eq(tripAiConversation.userId, userId)))
        .limit(1)
    if (!rows[0]) throw new ApiError('NOT_FOUND', 'error.aiProposalNotFound')
    if (rows[0].proposal.status !== 'pending') throw new ApiError('VALIDATION_ERROR', 'error.aiProposalAlreadyDecided')
    if (decision === 'reject') {
        await getDb().update(tripAiProposal).set({ status: 'rejected' }).where(eq(tripAiProposal.id, proposalId))
        return { status: 'rejected' as const }
    }
    await assertTripAccess(rows[0].proposal.tripId, userId, 'edit')
    // Applying changes is deliberately a separate domain operation. The API returns the validated diff and the UI asks for confirmation.
    await getDb().update(tripAiProposal).set({ status: 'approved' }).where(eq(tripAiProposal.id, proposalId))
    return { status: 'approved' as const, changes: rows[0].proposal.changes as AiProposalChange[] }
}

export const applyAiProposal = async (userId: string, proposalId: string) => {
    const rows = await getDb()
        .select({ proposal: tripAiProposal, conversation: tripAiConversation })
        .from(tripAiProposal)
        .innerJoin(tripAiJob, eq(tripAiProposal.jobId, tripAiJob.id))
        .innerJoin(tripAiConversation, eq(tripAiJob.conversationId, tripAiConversation.id))
        .where(and(eq(tripAiProposal.id, proposalId), eq(tripAiConversation.userId, userId)))
        .limit(1)
    if (!rows[0]) throw new ApiError('NOT_FOUND', 'error.aiProposalNotFound')
    if (rows[0].proposal.status !== 'approved') throw new ApiError('VALIDATION_ERROR', 'error.aiProposalApprovalRequired')
    await assertTripAccess(rows[0].proposal.tripId, userId, 'edit')
    const trip = await findTripDetail(rows[0].proposal.tripId)
    if (!trip) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
    const changes = rows[0].proposal.changes as AiProposalChange[]
    const byDay = new Map<number, AiProposalChange[]>()
    for (const change of changes) byDay.set(change.dayIndex, [...(byDay.get(change.dayIndex) ?? []), change])
    for (const [dayIndex, dayChanges] of byDay) {
        const day = trip.days[dayIndex]
        if (!day) throw new ApiError('VALIDATION_ERROR', 'error.aiProposalNotFound')
        const items = day.scheduleItems.map((item) => ({ ...item }))
        for (const change of dayChanges) {
            if (change.operation === 'delete') {
                const index = items.findIndex((item) => item.id === change.itemId)
                if (index < 0) throw new ApiError('VALIDATION_ERROR', 'error.aiProposalNotFound')
                items.splice(index, 1)
                continue
            }
            if (change.operation === 'update') {
                const index = items.findIndex((item) => item.id === change.itemId)
                if (index < 0) throw new ApiError('VALIDATION_ERROR', 'error.aiProposalNotFound')
                items[index] = {
                    ...items[index],
                    timeLabel: change.timeLabel ?? items[index].timeLabel,
                    title: change.title ?? items[index].title,
                    note: change.note === undefined ? items[index].note : change.note,
                    kindId: change.kindId ?? items[index].kindId,
                }
                continue
            }
            if (!change.title || !change.timeLabel || !change.kindId || !trip.scheduleKinds.some((kind) => kind.id === change.kindId))
                throw new ApiError('VALIDATION_ERROR', 'error.aiProposalNotFound')
            items.push({
                id: crypto.randomUUID(),
                timeLabel: change.timeLabel,
                title: change.title,
                note: change.note ?? null,
                kindId: change.kindId,
                bufferNote: null,
                mapQuery: null,
                sortOrder: items.length,
                dayId: day.id,
            })
        }
        const validated = dayInputSchema.parse({ ...day, scheduleItems: items })
        await saveDay(trip.id, validated)
    }
    await getDb().update(tripAiProposal).set({ status: 'applied' }).where(eq(tripAiProposal.id, proposalId))
    return { status: 'applied' as const }
}

export const getAiUsageSummary = async (userId: string) => {
    const since = new Date()
    since.setDate(1)
    const rows = await getDb()
        .select({ provider: tripAiUsage.provider, inputTokens: tripAiUsage.inputTokens, outputTokens: tripAiUsage.outputTokens })
        .from(tripAiUsage)
        .where(and(eq(tripAiUsage.userId, userId), gte(tripAiUsage.createdAt, since)))
    return rows.reduce<Record<string, { inputTokens: number; outputTokens: number }>>((summary, row) => {
        const current = summary[row.provider] ?? { inputTokens: 0, outputTokens: 0 }
        current.inputTokens += row.inputTokens
        current.outputTokens += row.outputTokens
        summary[row.provider] = current
        return summary
    }, {})
}
