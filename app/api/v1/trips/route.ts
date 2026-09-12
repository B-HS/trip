import { tripCreateSchema } from '@/entities/trip/trip.validate'
import { createTrip, createTripFromTemplate, findTripSummariesForUser } from '@/entities/trip/trip.repository'
import { tripTemplateSchema } from '@/shared/lib/trip-template'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'
import { withDeveloperApi, parseJson, parsePage, requireIdempotencyKey } from '@/shared/lib/developer-api-handler'
import { readIdempotentResponse, requestFingerprint, writeIdempotentResponse } from '@/shared/lib/api-idempotency'
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
        const cached = readIdempotentResponse(auth.tokenId, key, hash)
        if (cached) return cached.response
        if (!body || typeof body !== 'object') throw new ApiError('VALIDATION_ERROR', 'error.invalidInput')
        const data = body as Record<string, unknown>
        const created =
            Array.isArray(data.flights) || Array.isArray(data.days) || Array.isArray(data.scheduleKinds)
                ? await createTripFromTemplate(auth.userId, tripTemplateSchema.parse(body))
                : await (async () => {
                      const parsed = tripCreateSchema.parse(body)
                      const { destinations, ...basics } = parsed
                      return createTrip(auth.userId, basics, destinations, 'en')
                  })()
        writeIdempotentResponse(auth.tokenId, key, hash, created)
        return created
    })
