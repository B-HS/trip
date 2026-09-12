import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripDetail, replaceTripFromTemplate, deleteTrip } from '@/entities/trip/trip.repository'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import { withDeveloperApi, parseJson, requireIdempotencyKey } from '@/shared/lib/developer-api-handler'
import { readIdempotentResponse, requestFingerprint, writeIdempotentResponse } from '@/shared/lib/api-idempotency'
import { ApiError } from '@/shared/lib/api-response'

type Context = { params: Promise<{ tripId: string }> }

const idFor = async (context: Context) => (await context.params).tripId

export const GET = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:read')
        const tripId = await idFor(context)
        await assertTripAccess(tripId, auth.userId, 'own')
        const detail = await findTripDetail(tripId)
        if (detail === null) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
        return detail
    })

export const PUT = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        await assertTripAccess(tripId, auth.userId, 'own')
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const cached = readIdempotentResponse(auth.tokenId, key, hash)
        if (cached) return cached.response
        const template = tripTemplateSchema.parse(body)
        const saved = await replaceTripFromTemplate(tripId, template)
        writeIdempotentResponse(auth.tokenId, key, hash, saved)
        return saved
    })

export const DELETE = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        await assertTripAccess(tripId, auth.userId, 'own')
        const key = requireIdempotencyKey(request)
        const hash = await requestFingerprint(request, null)
        const cached = readIdempotentResponse(auth.tokenId, key, hash)
        if (cached) return cached.response
        await deleteTrip(tripId)
        const response = { id: tripId, deleted: true }
        writeIdempotentResponse(auth.tokenId, key, hash, response)
        return response
    })
