import 'server-only'
import { send } from '@vercel/queue'
import { processAiJob } from '@/entities/ai/ai.repository'
import { getEnv } from '@/shared/lib/env'

export const enqueueAiJob = async (jobId: string) => {
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
