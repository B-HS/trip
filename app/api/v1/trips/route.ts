import { tripCreateSchema } from '@/entities/trip/trip.validate'
import { createTrip, createTripFromTemplate, findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import { developerApiResponse, withDeveloperApi, parseJson, parsePage, requireIdempotencyKey } from '@/shared/lib/developer-api-handler'
import { claimIdempotency, completeIdempotency, releaseIdempotency, requestFingerprint } from '@/shared/lib/api-idempotency'
import { buildPage } from '@/shared/lib/pagination'
import { ApiError } from '@/shared/lib/api-response'

export const GET = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:read')
        const { page, pageSize } = parsePage(request)
        const rows = await findTripSummariesForUser(auth.userId, true)
        const pagination = buildPage(rows.length, page, pageSize)
        return {
            items: rows.slice(pagination.offset, pagination.offset + pagination.pageSize),
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            pageCount: pagination.pageCount,
        }
    })

export const POST = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const replay = await claimIdempotency(auth.tokenId, key, hash)
        if (replay) return developerApiResponse(replay.response, { status: replay.status })
        const data = body as Record<string, unknown>
        try {
            if (!body || typeof body !== 'object') throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
            if (Array.isArray(data.flights) || Array.isArray(data.days) || Array.isArray(data.scheduleKinds)) {
                if (!Array.isArray(data.destinations) || data.destinations.length === 0) throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
                const created = await createTripFromTemplate(auth.userId, tripTemplateSchema.parse(body))
                await completeIdempotency(auth.tokenId, key, hash, created, 201)
                return developerApiResponse(created, { status: 201 })
            }
            const parsed = tripCreateSchema.parse(body)
            const { destinations, ...basics } = parsed
            const created = await createTrip(auth.userId, basics, destinations, 'en')
            await completeIdempotency(auth.tokenId, key, hash, created, 201)
            return developerApiResponse(created, { status: 201 })
        } catch (error) {
            await releaseIdempotency(auth.tokenId, key, hash)
            throw error
        }
    })
