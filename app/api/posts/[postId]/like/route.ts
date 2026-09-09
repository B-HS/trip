import { NextResponse } from 'next/server'
import { findPostLikeState } from '@/entities/community/community.repository.likes'
import { successResponse } from '@/shared/lib/api-response'
import { withRouteErrorHandling } from '@/shared/lib/route-handler'
import { getServerSession } from '@/shared/lib/session'

export const GET = withRouteErrorHandling(async (request: Request, context: { params: Promise<{ postId: string }> }) => {
    const { postId } = await context.params
    const session = await getServerSession()
    return NextResponse.json(successResponse(await findPostLikeState(postId, session?.user.id ?? null)))
})
