import { NextResponse } from 'next/server'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { getCachedTripDetail } from '@/entities/trip/trip.cache'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request, context: { params: Promise<{ tripId: string }> }) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        const { tripId } = await context.params
        const viewerRole = await assertTripAccess(tripId, session.user.id, 'view')
        const detail = await getCachedTripDetail(tripId)
        if (detail === null) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
        return NextResponse.json(successResponse({ ...detail, viewerRole }))
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
