import { tripCreateSchema } from '@/entities/trip/trip.validate'
import {
    countOwnedTripsForUser,
    createTripInTransaction,
    createTripFromTemplateInTransaction,
    findTripSummariesForUser,
} from '@/entities/trip/trip.repository'
import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import { developerApiResponse, withDeveloperApi, parseJson, parsePage, requireIdempotencyKey } from '@/shared/lib/developer-api-handler'
import { requestFingerprint, runIdempotentMutation } from '@/shared/lib/api-idempotency'
import { ApiError } from '@/shared/lib/api-response'
import { buildPage } from '@/shared/lib/pagination'

export const GET = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:read')
        const { page, pageSize } = parsePage(request)
        const total = await countOwnedTripsForUser(auth.userId)
        const pagination = buildPage(total, page, pageSize)
        const rows = await findTripSummariesForUser(auth.userId, true, pagination)
        return {
            items: rows,
            ...pagination,
        }
    })

export const POST = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'trips:write')
        const key = requireIdempotencyKey(request)
        const body = await parseJson(request)
        const hash = await requestFingerprint(request, body)
        const result = await runIdempotentMutation(auth.tokenId, key, hash, async (tx) => {
            if (!body || typeof body !== 'object') throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
            const data = body as Record<string, unknown>
            const templateOnlyFields = ['sidebarNote', 'flights', 'lodgings', 'sidebarLinks', 'scheduleKinds', 'days', 'bookings', 'infoSections']
            if (templateOnlyFields.some((field) => Object.prototype.hasOwnProperty.call(data, field))) {
                if (!Array.isArray(data.destinations) || data.destinations.length === 0) throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
                const created = await createTripFromTemplateInTransaction(tx, auth.userId, tripTemplateSchema.parse(body))
                return { response: created, status: 201 }
            }
            const parsed = tripCreateSchema.parse(body)
            const { destinations, ...basics } = parsed
            const created = await createTripInTransaction(tx, auth.userId, basics, destinations, 'en')
            return { response: created, status: 201 }
        })
        return developerApiResponse(result.response, { status: result.status, headers: result.headers })
    })
