import 'server-only'
import { and, eq, isNull, lte, lt, or } from 'drizzle-orm'
import { send } from '@vercel/queue'
import { processAiJob } from '@/entities/ai/ai.repository'
import { tripAiDispatch } from '@/shared/db/schema/ai'
import { getDb } from '@/shared/db/client'
import { getEnv } from '@/shared/lib/env'

const DISPATCH_LEASE_MS = 2 * 60 * 1000
const MAX_BACKOFF_MS = 15 * 60 * 1000

const publish = async (jobId: string) => {
    const env = getEnv()
    // The SDK obtains its bearer token from Vercel OIDC. A region alone is not
    // enough to authenticate a local process, so use the documented REST
    // fallback whenever explicit queue credentials are supplied outside Vercel.
    if (env.VERCEL_ENV) {
        await send('ai-job', { jobId }, { idempotencyKey: jobId, retentionSeconds: 24 * 60 * 60, region: env.VERCEL_QUEUE_REGION as never })
        return
    }
    if (env.VERCEL_QUEUE_URL && env.VERCEL_QUEUE_TOKEN) {
        const response = await fetch(`${env.VERCEL_QUEUE_URL.replace(/\/$/, '')}/api/v3/topic/ai-job`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${env.VERCEL_QUEUE_TOKEN}`, 'content-type': 'application/json', 'Vqs-Idempotency-Key': jobId },
            body: JSON.stringify({ jobId }),
        })
        if (!response.ok) throw new Error('AI queue request failed')
        return
    }
    // Local/test fallback keeps deterministic fakes useful without silently changing production behavior.
    queueMicrotask(() => processAiJob(jobId).catch(() => undefined))
}

/** Claims one durable outbox row before publishing. */
export const dispatchAiJob = async (jobId: string) => {
    const db = getDb()
    const now = new Date()
    const leaseId = crypto.randomUUID()
    const claimed = await db.transaction(async (tx) => {
        const [row] = await tx.select().from(tripAiDispatch).where(eq(tripAiDispatch.jobId, jobId)).limit(1).for('update')
        if (!row) return false
        if (row.status === 'sent') return false
        if (row.status === 'failed' && row.nextAttemptAt && row.nextAttemptAt > now) return false
        if (row.status === 'sending' && row.leaseExpiresAt && row.leaseExpiresAt > now) return false
        await tx
            .update(tripAiDispatch)
            .set({
                status: 'sending',
                leaseId,
                leaseExpiresAt: new Date(now.getTime() + DISPATCH_LEASE_MS),
                attempts: row.attempts + 1,
                lastAttemptAt: now,
            })
            .where(eq(tripAiDispatch.jobId, jobId))
        return true
    })
    if (!claimed) return false
    try {
        await publish(jobId)
        await db
            .update(tripAiDispatch)
            .set({ status: 'sent', leaseId: null, leaseExpiresAt: null, nextAttemptAt: null, lastError: null })
            .where(and(eq(tripAiDispatch.jobId, jobId), eq(tripAiDispatch.status, 'sending'), eq(tripAiDispatch.leaseId, leaseId)))
        return true
    } catch (error) {
        const [row] = await db.select({ attempts: tripAiDispatch.attempts }).from(tripAiDispatch).where(eq(tripAiDispatch.jobId, jobId)).limit(1)
        const backoff = Math.min(MAX_BACKOFF_MS, 2 ** Math.max(0, (row?.attempts ?? 1) - 1) * 1000)
        await db
            .update(tripAiDispatch)
            .set({
                status: 'failed',
                leaseId: null,
                leaseExpiresAt: null,
                nextAttemptAt: new Date(Date.now() + backoff),
                lastError: error instanceof Error ? error.message.slice(0, 500) : 'AI queue publish failed',
            })
            .where(and(eq(tripAiDispatch.jobId, jobId), eq(tripAiDispatch.status, 'sending'), eq(tripAiDispatch.leaseId, leaseId)))
        return false
    }
}

export const dispatchPendingAiJobs = async (limit = 20) => {
    const now = new Date()
    const rows = await getDb()
        .select({ jobId: tripAiDispatch.jobId })
        .from(tripAiDispatch)
        .where(
            or(
                eq(tripAiDispatch.status, 'queued'),
                and(eq(tripAiDispatch.status, 'failed'), or(isNull(tripAiDispatch.nextAttemptAt), lte(tripAiDispatch.nextAttemptAt, now))),
                and(eq(tripAiDispatch.status, 'sending'), lt(tripAiDispatch.leaseExpiresAt, now)),
            ),
        )
        .limit(limit)
    let dispatched = 0
    for (const row of rows) if (await dispatchAiJob(row.jobId)) dispatched += 1
    return { attempted: rows.length, dispatched }
}

export const enqueueAiJob = async (jobId: string) => {
    // The job and outbox row were committed before this call. A failed initial
    // publish is durable and is reconciled by the cron dispatcher.
    await dispatchAiJob(jobId)
}
