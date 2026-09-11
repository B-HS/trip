import { NextResponse } from 'next/server'
import { findComments } from '@/entities/community/community.repository.comments'
import { successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'
import { withRouteErrorHandling } from '@/shared/lib/route-handler'

export const GET = withRouteErrorHandling(async (request: Request, context: { params: Promise<{ postId: string }> }) => {
    const { postId } = await context.params
    const session = await getServerSession()
    return NextResponse.json(successResponse(await findComments(postId, session?.user.id ?? null)))
})
