import { NextResponse } from 'next/server'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripUserState } from '@/entities/user-state/user-state.repository'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request, context: { params: Promise<{ tripId: string }> }) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        const { tripId } = await context.params
        await assertTripAccess(tripId, session.user.id, 'view')
        return NextResponse.json(successResponse(await findTripUserState(tripId, session.user.id)))
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
