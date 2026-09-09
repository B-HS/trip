import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripIsPublic, findTripLikeState } from '@/entities/trip/trip.repository.likes'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request, context: { params: Promise<{ tripId: string }> }) => {
    try {
        const { tripId } = await context.params
        const session = await getServerSession()
        if ((await findTripIsPublic(tripId)) !== true) {
            if (!session) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
            await assertTripAccess(tripId, session.user.id, 'view')
        }
        return NextResponse.json(successResponse(await findTripLikeState(tripId, session?.user.id ?? null)))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
