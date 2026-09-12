import { handleCallback } from '@vercel/queue'
import { processAiJob } from '@/entities/ai/ai.repository'

export const maxDuration = 300

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
