import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/shared/lib/session'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError } from '@/shared/lib/api-response'
import { issueDeveloperApiToken, listDeveloperApiTokens } from '@/shared/lib/developer-api-token'

const createSchema = z.object({
    label: z.string().trim().min(1).max(80),
    scopes: z.array(z.string()).min(1),
    expiresAt: z.string().datetime().nullable().optional(),
})

export const GET = async () => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        return NextResponse.json({ success: true, data: { items: await listDeveloperApiTokens(session.user.id) } })
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}

export const POST = async (request: Request) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        const input = createSchema.parse(await request.json())
        const created = await issueDeveloperApiToken(session.user.id, { ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null })
        return NextResponse.json({ success: true, data: created }, { status: 201 })
    } catch (error) {
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
