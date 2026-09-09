import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'

export const withRouteErrorHandling =
    <TContext>(handler: (request: Request, context: TContext) => Promise<Response>) =>
    async (request: Request, context: TContext) => {
        try {
            return await handler(request, context)
        } catch (error) {
            unstable_rethrow(error)
            const body = toErrorResponse(error)
            return NextResponse.json(body, { status: errorResponseStatus(body) })
        }
    }
