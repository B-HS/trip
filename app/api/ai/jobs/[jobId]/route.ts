import { NextResponse } from 'next/server'
import { getAiJob } from '@/entities/ai/ai.repository'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (_request: Request, context: { params: Promise<{ jobId: string }> }) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        return NextResponse.json(successResponse(await getAiJob(session.user.id, (await context.params).jobId)))
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
