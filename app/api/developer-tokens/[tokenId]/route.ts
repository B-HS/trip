import { NextResponse } from 'next/server'
import { getServerSession } from '@/shared/lib/session'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError } from '@/shared/lib/api-response'
import { revokeDeveloperApiToken } from '@/shared/lib/developer-api-token'

export const DELETE = async (_request: Request, context: { params: Promise<{ tokenId: string }> }) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        await revokeDeveloperApiToken(session.user.id, (await context.params).tokenId)
        return NextResponse.json({ success: true, data: { revoked: true } })
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
