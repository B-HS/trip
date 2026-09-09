import 'server-only'
import { and, asc, count, desc, eq, gte, isNotNull, lte, type SQL } from 'drizzle-orm'
import type { HomeTrips, PublicTripCard, PublicTripCardPage } from '@/entities/trip/trip.type'
import { HOME_TRIP_LIMIT, PAGE_SIZE, type ExploreSort } from '@/shared/constant/community'
import { getDb } from '@/shared/db/client'
import { trip } from '@/shared/db/schema/trip'
import { monthRange, weekRange } from '@/shared/lib/date-range'
import { buildPage } from '@/shared/lib/pagination'

const FIRST_OFFSET = 0
const POPULAR_SORT: ExploreSort = 'popular'

const RECENT_ORDER = [desc(trip.updatedAt)]
const POPULAR_ORDER = [desc(trip.likeCount), desc(trip.updatedAt)]
const UPCOMING_ORDER = [asc(trip.startDate)]

const findTripCardRows = async (condition: SQL | undefined, orderBy: SQL[], limit: number, offset: number) =>
    getDb().query.trip.findMany({
        where: condition,
        orderBy,
        limit,
        offset,
        with: {
            owner: { columns: { id: true, name: true, username: true, image: true } },
            destinations: { orderBy: (fields, { asc: ascending }) => [ascending(fields.sortOrder)], columns: { countryCode: true, city: true } },
            flights: {
                orderBy: (fields, { asc: ascending }) => [ascending(fields.sortOrder)],
                columns: { direction: true, departCode: true, arriveCode: true },
            },
        },
    })

type TripCardRow = Awaited<ReturnType<typeof findTripCardRows>>[number]

const toPublicTripCard = (row: TripCardRow, shareSlug: string) =>
    ({
        id: row.id,
        title: row.title,
        eyebrow: row.eyebrow,
        destination: row.destination,
        startDate: row.startDate,
        endDate: row.endDate,
        customNights: row.customNights,
        customDays: row.customDays,
        periodNote: row.periodNote,
        shareSlug,
        likeCount: row.likeCount,
        destinations: row.destinations,
        flights: row.flights,
        owner: row.owner,
        updatedAt: row.updatedAt.toISOString(),
    }) satisfies PublicTripCard

const findTripCards = async (condition: SQL | undefined, orderBy: SQL[], limit: number, offset: number) => {
    const rows = await findTripCardRows(condition, orderBy, limit, offset)
    return rows.flatMap((row) => (row.shareSlug === null ? [] : [toPublicTripCard(row, row.shareSlug)]))
}

const countTrips = async (condition: SQL | undefined) => {
    const [row] = await getDb().select({ value: count() }).from(trip).where(condition)
    return row?.value ?? 0
}

export const publicTripCondition = () => and(eq(trip.isPublic, true), isNotNull(trip.shareSlug))

export const findPublicTripCardPage = async (condition: SQL | undefined, page: number, orderBy: SQL[] = RECENT_ORDER) => {
    const total = await countTrips(condition)
    const pageInfo = buildPage(total, page, PAGE_SIZE)
    return {
        items: await findTripCards(condition, orderBy, pageInfo.pageSize, pageInfo.offset),
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        total: pageInfo.total,
        pageCount: pageInfo.pageCount,
    } satisfies PublicTripCardPage
}

export const findPublicTripPage = async ({ sort, page }: { sort: ExploreSort; page: number }) =>
    findPublicTripCardPage(publicTripCondition(), page, sort === POPULAR_SORT ? POPULAR_ORDER : RECENT_ORDER)

export const findRecentPublicTrips = async (limit: number) => findTripCards(publicTripCondition(), RECENT_ORDER, limit, FIRST_OFFSET)

export const findPublicTripsForHome = async (today: string) => {
    const base = publicTripCondition()
    const week = weekRange(today)
    const month = monthRange(today)
    const [thisWeek, thisMonth, recent, popular] = await Promise.all([
        findTripCards(and(base, gte(trip.startDate, week.start), lte(trip.startDate, week.end)), UPCOMING_ORDER, HOME_TRIP_LIMIT, FIRST_OFFSET),
        findTripCards(and(base, gte(trip.startDate, month.start), lte(trip.startDate, month.end)), UPCOMING_ORDER, HOME_TRIP_LIMIT, FIRST_OFFSET),
        findTripCards(base, RECENT_ORDER, HOME_TRIP_LIMIT, FIRST_OFFSET),
        findTripCards(base, POPULAR_ORDER, HOME_TRIP_LIMIT, FIRST_OFFSET),
    ])
    return { thisWeek, thisMonth, recent, popular } satisfies HomeTrips
}
