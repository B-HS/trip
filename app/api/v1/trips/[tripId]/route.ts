import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertTripAccess } from '@/entities/trip/trip.access'
import { findTripDetail, replaceTripFromTemplate, deleteTrip } from '@/entities/trip/trip.repository'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import {
    developerApiResponse,
    etagForUpdatedAt,
    requireConfirmation,
    requireIfMatch,
    withDeveloperApi,
    parseJson,
    requireIdempotencyKey,
} from '@/shared/lib/developer-api-handler'
import { claimIdempotency, completeIdempotency, releaseIdempotency, requestFingerprint } from '@/shared/lib/api-idempotency'
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
        return developerApiResponse(detail, { headers: { ETag: etagForUpdatedAt(detail.updatedAt) } })
    })

export const PUT = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const replay = await claimIdempotency(auth.tokenId, key, hash)
        if (replay) return developerApiResponse(replay.response, { status: replay.status })
        try {
            requireConfirmation(request, 'replace')
            await assertTripAccess(tripId, auth.userId, 'own')
            const current = await findTripDetail(tripId)
            if (!current) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
            requireIfMatch(request, current.updatedAt)
            if (
                !body ||
                typeof body !== 'object' ||
                !Array.isArray((body as Record<string, unknown>).destinations) ||
                (body as { destinations: unknown[] }).destinations.length === 0
            )
                throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
            const template = tripTemplateSchema.parse(body)
            const saved = await replaceTripFromTemplate(tripId, template)
            const updated = await findTripDetail(tripId)
            await completeIdempotency(auth.tokenId, key, hash, saved)
            return developerApiResponse(saved, { headers: updated ? { ETag: etagForUpdatedAt(updated.updatedAt) } : undefined })
        } catch (error) {
            await releaseIdempotency(auth.tokenId, key, hash)
            throw error
        }
    })

export const DELETE = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        const key = requireIdempotencyKey(request)
        const hash = await requestFingerprint(request, null)
        const replay = await claimIdempotency(auth.tokenId, key, hash)
        if (replay) return developerApiResponse(replay.response, { status: replay.status })
        try {
            requireConfirmation(request, 'delete')
            await assertTripAccess(tripId, auth.userId, 'own')
            const current = await findTripDetail(tripId)
            if (!current) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
            requireIfMatch(request, current.updatedAt)
            await deleteTrip(tripId)
            const response = { id: tripId, deleted: true }
            await completeIdempotency(auth.tokenId, key, hash, response)
            return response
        } catch (error) {
            await releaseIdempotency(auth.tokenId, key, hash)
            throw error
        }
    })
