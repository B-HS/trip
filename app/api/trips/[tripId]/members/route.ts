import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripInvites, findTripMembers } from '@/entities/trip/trip.repository.members'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async (request: Request, context: { params: Promise<{ tripId: string }> }) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        const { tripId } = await context.params
        await assertTripAccess(tripId, session.user.id, 'own')
        const [members, invites] = await Promise.all([findTripMembers(tripId), findTripInvites(tripId)])
        return NextResponse.json(successResponse({ members, invites }))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
