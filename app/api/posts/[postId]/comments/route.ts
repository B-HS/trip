import { NextResponse } from 'next/server'
import { findComments } from '@/entities/community/community.repository.comments'
import { successResponse } from '@/shared/lib/api-response'
import { withRouteErrorHandling } from '@/shared/lib/route-handler'

export const GET = withRouteErrorHandling(async (request: Request, context: { params: Promise<{ postId: string }> }) => {
    const { postId } = await context.params
    return NextResponse.json(successResponse(await findComments(postId)))
})
