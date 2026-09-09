import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { findComments } from '@/entities/community/community.repository.comments'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { successResponse } from '@/shared/lib/api-response'

export const GET = async (request: Request, context: { params: Promise<{ postId: string }> }) => {
    try {
        const { postId } = await context.params
        return NextResponse.json(successResponse(await findComments(postId)))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
