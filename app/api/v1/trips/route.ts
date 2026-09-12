import { tripCreateSchema } from '@/entities/trip/trip.validate'
import { countOwnedTripsForUser, createTrip, createTripFromTemplate, findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import { developerApiResponse, withDeveloperApi, parseJson, parsePage, requireIdempotencyKey } from '@/shared/lib/developer-api-handler'
import { claimIdempotency, completeIdempotency, releaseIdempotency, requestFingerprint } from '@/shared/lib/api-idempotency'
import { ApiError } from '@/shared/lib/api-response'

export const GET = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:read')
        const { page, pageSize } = parsePage(request)
        const [rows, total] = await Promise.all([
            findTripSummariesForUser(auth.userId, true, { page, pageSize }),
            countOwnedTripsForUser(auth.userId),
        ])
        const pageCount = Math.ceil(total / pageSize)
        return {
            items: rows,
            page,
            pageSize,
            total,
            pageCount,
        }
    })

export const POST = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const claim = await claimIdempotency(auth.tokenId, key, hash)
        if (claim.replay) return developerApiResponse(claim.replay.response, { status: claim.replay.status, headers: claim.replay.headers })
        let mutationCommitted = false
        try {
            if (!body || typeof body !== 'object') throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
            const data = body as Record<string, unknown>
            const templateOnlyFields = ['sidebarNote', 'flights', 'lodgings', 'sidebarLinks', 'scheduleKinds', 'days', 'bookings', 'infoSections']
            if (templateOnlyFields.some((field) => Object.prototype.hasOwnProperty.call(data, field))) {
                if (!Array.isArray(data.destinations) || data.destinations.length === 0) throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
                const created = await createTripFromTemplate(auth.userId, tripTemplateSchema.parse(body))
                mutationCommitted = true
                await completeIdempotency(auth.tokenId, key, hash, claim.claimNonce, created, 201)
                return developerApiResponse(created, { status: 201 })
            }
            const parsed = tripCreateSchema.parse(body)
            const { destinations, ...basics } = parsed
            const created = await createTrip(auth.userId, basics, destinations, 'en')
            mutationCommitted = true
            await completeIdempotency(auth.tokenId, key, hash, claim.claimNonce, created, 201)
            return developerApiResponse(created, { status: 201 })
        } catch (error) {
            if (!mutationCommitted) await releaseIdempotency(auth.tokenId, key, hash, claim.claimNonce)
            throw error
        }
    })
