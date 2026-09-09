import { NextResponse } from 'next/server'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripIsPublic, findTripLikeState } from '@/entities/trip/trip.repository.likes'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { withRouteErrorHandling } from '@/shared/lib/route-handler'
import { getServerSession } from '@/shared/lib/session'

export const GET = withRouteErrorHandling(async (request: Request, context: { params: Promise<{ tripId: string }> }) => {
    const { tripId } = await context.params
    const session = await getServerSession()
    if ((await findTripIsPublic(tripId)) !== true) {
        if (!session) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
        await assertTripAccess(tripId, session.user.id, 'view')
    }
    return NextResponse.json(successResponse(await findTripLikeState(tripId, session?.user.id ?? null)))
})
