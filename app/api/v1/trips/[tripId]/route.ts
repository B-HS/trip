import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertTripAccess } from '@/entities/trip/trip.access'
import {
    deleteTripIfRevisionUnchangedInTransaction,
    findTripDetail,
    purgeTripUploadObjects,
    replaceTripFromTemplateIfRevisionUnchangedInTransaction,
} from '@/entities/trip/trip.repository'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import {
    developerApiResponse,
    etagForRevision,
    requireConfirmation,
    requireIfMatch,
    withDeveloperApi,
    parseJson,
    requireIdempotencyKey,
} from '@/shared/lib/developer-api-handler'
import { requestFingerprint, runIdempotentMutation } from '@/shared/lib/api-idempotency'
import { ApiError } from '@/shared/lib/api-response'
import { eq } from 'drizzle-orm'
import { trip as tripTable } from '@/shared/db/schema/trip'
import { toDeveloperTripDetail } from '@/shared/lib/developer-api-dto'

type Context = { params: Promise<{ tripId: string }> }

const idFor = async (context: Context) => (await context.params).tripId

export const GET = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:read')
        const tripId = await idFor(context)
        await assertTripAccess(tripId, auth.userId, 'own')
        const detail = await findTripDetail(tripId)
        if (detail === null) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
        return developerApiResponse(toDeveloperTripDetail(detail), { headers: { ETag: etagForRevision(detail.revision) } })
    })

export const PUT = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const result = await runIdempotentMutation(auth.tokenId, key, hash, async (tx) => {
            requireConfirmation(request, 'replace')
            await assertTripAccess(tripId, auth.userId, 'own')
            const current = await findTripDetail(tripId)
            if (!current) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
            requireIfMatch(request, current.revision)
            if (
                !body ||
                typeof body !== 'object' ||
                !Array.isArray((body as Record<string, unknown>).destinations) ||
                (body as { destinations: unknown[] }).destinations.length === 0
            )
                throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
            const template = tripTemplateSchema.parse(body)
            const saved = await replaceTripFromTemplateIfRevisionUnchangedInTransaction(tx, tripId, template, current.revision)
            const [updated] = await tx.select({ revision: tripTable.revision }).from(tripTable).where(eq(tripTable.id, tripId)).limit(1)
            const responseHeaders: Record<string, string> = updated ? { ETag: etagForRevision(updated.revision) } : {}
            return {
                response: { id: saved.id },
                headers: responseHeaders,
                afterCommit: () => purgeTripUploadObjects(saved.removedUploadKeys),
            }
        })
        return developerApiResponse(result.response, { status: result.status, headers: result.headers })
    })

export const DELETE = async (request: Request, context: Context) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const tripId = await idFor(context)
        const key = requireIdempotencyKey(request)
        const hash = await requestFingerprint(request, null)
        const result = await runIdempotentMutation(auth.tokenId, key, hash, async (tx) => {
            requireConfirmation(request, 'delete')
            await assertTripAccess(tripId, auth.userId, 'own')
            const current = await findTripDetail(tripId)
            if (!current) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
            requireIfMatch(request, current.revision)
            const removedUploadKeys = await deleteTripIfRevisionUnchangedInTransaction(tx, tripId, current.revision)
            const response = { id: tripId, deleted: true }
            return { response, afterCommit: () => purgeTripUploadObjects(removedUploadKeys) }
        })
        return developerApiResponse(result.response, { status: result.status, headers: result.headers })
    })
