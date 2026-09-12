import { handleCallback } from '@vercel/queue'
import { processAiJob } from '@/entities/ai/ai.repository'

export const maxDuration = 300

// Vercel's handleCallback validates the queue callback envelope/authentication
// boundary. VERCEL_QUEUE_TOKEN is only used by the REST publisher fallback and
// must never be treated as a callback bearer secret.
const handleQueueCallback = handleCallback<{ jobId: string }>(
    async (message) => {
        if (!message.jobId) throw new Error('invalid queue message')
        await processAiJob(message.jobId)
    },
    {
        retry: (_error, metadata) => (metadata.deliveryCount > 3 ? { acknowledge: true } : { afterSeconds: 60 }),
    },
)

export const POST = (request: Request) => handleQueueCallback(request)
