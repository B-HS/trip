import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { findPostLikeState } from '@/entities/community/community.repository.likes'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request, context: { params: Promise<{ postId: string }> }) => {
    try {
        const { postId } = await context.params
        const session = await getServerSession()
        return NextResponse.json(successResponse(await findPostLikeState(postId, session?.user.id ?? null)))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
