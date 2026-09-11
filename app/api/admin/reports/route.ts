import { NextResponse } from 'next/server'
import { isAdminRole } from '@/entities/auth/auth.role'
import { findOpenReportsPage } from '@/entities/community/community.repository.report'
import { pageSchema } from '@/entities/community/community.validate'
import { PAGE_PARAM, PAGE_SIZE } from '@/shared/constant/community'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getServerSession } from '@/shared/lib/session'
import { withRouteErrorHandling } from '@/shared/lib/route-handler'

export const GET = withRouteErrorHandling(async (request: Request) => {
    const session = await getServerSession()
    if (!session) throw new ApiError('UNAUTHORIZED')
    if (!isAdminRole(session.user.role)) throw new ApiError('FORBIDDEN')

    const page = pageSchema.parse(new URL(request.url).searchParams.get(PAGE_PARAM))
    const offset = (page - 1) * PAGE_SIZE
    return NextResponse.json(successResponse(await findOpenReportsPage(offset, PAGE_SIZE)))
})
