import { NextResponse } from 'next/server'
import { listAiModels } from '@/entities/ai/ai.repository'
import { aiProviderSchema } from '@/entities/ai/ai.validate'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        const params = new URL(request.url).searchParams
        const provider = aiProviderSchema.parse(params.get('provider'))
        return NextResponse.json(successResponse(await listAiModels(session.user.id, provider, params.get('refresh') === '1')))
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
