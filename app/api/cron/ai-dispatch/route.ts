import { NextResponse } from 'next/server'
import { dispatchPendingAiJobs } from '@/shared/lib/ai-queue'
import { pruneExpiredIdempotency } from '@/shared/lib/api-idempotency'
import { getEnv } from '@/shared/lib/env'
import { purgeOrphanedUploads } from '@/entities/trip/trip.repository'

export const maxDuration = 60

export const GET = async (request: Request) => {
    const secret = getEnv().CRON_SECRET
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const [dispatch, pruned, uploads] = await Promise.all([dispatchPendingAiJobs(), pruneExpiredIdempotency(), purgeOrphanedUploads()])
    return NextResponse.json({ dispatch, pruned, uploads })
}
