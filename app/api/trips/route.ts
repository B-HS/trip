import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { getCachedTripList } from '@/entities/trip/trip.cache'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'

export const GET = async () => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        return NextResponse.json(successResponse(await getCachedTripList(session.user.id)))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
