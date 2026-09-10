import 'server-only'
import { eq, inArray, type SQL } from 'drizzle-orm'
import { getTripRole } from '@/entities/trip/trip.access'
import { insertTemplateDays, removableIds, touchTrip } from '@/entities/trip/trip.repository.days'
import { resolveTripRole } from '@/entities/trip/trip.role'
import type { CreatedTrip, PublicTrip, ShareSettings, TripDetail, TripSummary, TripTransaction } from '@/entities/trip/trip.type'
import type {
    BookingAttachmentValues,
    BookingValues,
    DestinationValues,
    FlightValues,
    InfoBlockValues,
    InfoSectionValues,
    LodgingValues,
    ScheduleKindValues,
    ShareSettingsValues,
    SidebarValues,
    TripBasicsValues,
} from '@/entities/trip/trip.validate'
import { asAirportCode } from '@/shared/constant/airports'
import { isCountryCode } from '@/shared/constant/countries'
import { DEFAULT_SCHEDULE_KIND_KEY, DEFAULT_SCHEDULE_KINDS } from '@/shared/constant/trip'
import { getDb } from '@/shared/db/client'
import {
    trip,
    tripBooking,
    tripBookingAttachment,
    tripDay,
    tripDestination,
    tripFlight,
    tripInfoBlock,
    tripInfoSection,
    tripLodging,
    tripMember,
    tripScheduleItem,
    tripScheduleKind,
    tripSidebarLink,
    tripUpload,
} from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'
import { deleteObject, getUploadConfig } from '@/shared/lib/r2'
import type { TripTemplate } from '@/shared/lib/trip-template'

const SHARE_SLUG_SUFFIX_LENGTH = 8
const SHARE_SLUG_ATTEMPTS = 5
const BASE36_RADIX = 36
const FALLBACK_SLUG_BASE = 'trip'

type ReconcilableAttachment = Omit<BookingAttachmentValues, 'id' | 'uploadId'> & { id?: string; uploadId?: string | null }
type ReconcilableBooking = Omit<BookingValues, 'attachments'> & { attachments: ReconcilableAttachment[] }

const removeUploadedObjects = async (keys: string[]) => {
    if (keys.length === 0 || getUploadConfig() === null) return
    for (const key of keys) {
        try {
            await deleteObject(key)
        } catch (error) {
            console.error(error)
        }
    }
}

const toTripValues = (basics: TripBasicsValues) => ({
    title: basics.title,
    eyebrow: basics.eyebrow,
    destination: basics.destination,
    departureAirportCode: basics.departureAirportCode,
    startDate: basics.startDate,
    endDate: basics.endDate,
    customNights: basics.customNights,
    customDays: basics.customDays,
    periodNote: basics.periodNote,
    disclaimer: basics.disclaimer,
    verifiedOn: basics.verifiedOn,
    bufferPolicy: basics.bufferPolicy,
    bookingNote: basics.bookingNote,
    footerNote: basics.footerNote,
})

const reconcileDestinations = async (tx: TripTransaction, tripId: string, list: DestinationValues[]) => {
    const existing = await tx.select({ id: tripDestination.id }).from(tripDestination).where(eq(tripDestination.tripId, tripId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripDestination).where(inArray(tripDestination.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = { countryCode: item.countryCode, city: item.city, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripDestination).set(values).where(eq(tripDestination.id, id))
            continue
        }
        await tx.insert(tripDestination).values({ ...values, tripId })
    }
}

const reconcileFlights = async (tx: TripTransaction, tripId: string, list: FlightValues[]) => {
    const existing = await tx.select({ id: tripFlight.id }).from(tripFlight).where(eq(tripFlight.tripId, tripId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripFlight).where(inArray(tripFlight.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = {
            direction: item.direction,
            label: item.label,
            departCode: item.departCode,
            departTime: item.departTime,
            departTerminal: item.departTerminal,
            arriveCode: item.arriveCode,
            arriveTime: item.arriveTime,
            arriveTerminal: item.arriveTerminal,
            flightNumber: item.flightNumber,
            note: item.note,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripFlight).set(values).where(eq(tripFlight.id, id))
            continue
        }
        await tx.insert(tripFlight).values({ ...values, tripId })
    }
}

const reconcileLodgings = async (tx: TripTransaction, tripId: string, list: LodgingValues[]) => {
    const existing = await tx.select({ id: tripLodging.id }).from(tripLodging).where(eq(tripLodging.tripId, tripId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripLodging).where(inArray(tripLodging.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = {
            name: item.name,
            nameLocal: item.nameLocal,
            address: item.address,
            accessNote: item.accessNote,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            url: item.url,
            note: item.note,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripLodging).set(values).where(eq(tripLodging.id, id))
            continue
        }
        await tx.insert(tripLodging).values({ ...values, tripId })
    }
}

const reconcileSidebarLinks = async (tx: TripTransaction, tripId: string, list: SidebarValues['links']) => {
    const existing = await tx.select({ id: tripSidebarLink.id }).from(tripSidebarLink).where(eq(tripSidebarLink.tripId, tripId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripSidebarLink).where(inArray(tripSidebarLink.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = { label: item.label, url: item.url, description: item.description, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripSidebarLink).set(values).where(eq(tripSidebarLink.id, id))
            continue
        }
        await tx.insert(tripSidebarLink).values({ ...values, tripId })
    }
}

const findAttachmentUploadKeys = async (tx: TripTransaction, condition: SQL | undefined) => {
    const rows = await tx
        .select({ key: tripUpload.key })
        .from(tripBookingAttachment)
        .innerJoin(tripUpload, eq(tripBookingAttachment.uploadId, tripUpload.id))
        .where(condition)
    return rows.map((row) => row.key)
}

const reconcileBookingAttachments = async (tx: TripTransaction, bookingId: string, list: ReconcilableAttachment[]) => {
    const existing = await tx
        .select({ id: tripBookingAttachment.id })
        .from(tripBookingAttachment)
        .where(eq(tripBookingAttachment.bookingId, bookingId))
    const removable = removableIds(existing, list)
    const removedKeys = removable.length > 0 ? await findAttachmentUploadKeys(tx, inArray(tripBookingAttachment.id, removable)) : []
    if (removable.length > 0) await tx.delete(tripBookingAttachment).where(inArray(tripBookingAttachment.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = { kind: item.kind, url: item.url, label: item.label, uploadId: item.uploadId ?? null, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripBookingAttachment).set(values).where(eq(tripBookingAttachment.id, id))
            continue
        }
        await tx.insert(tripBookingAttachment).values({ ...values, bookingId })
    }
    return removedKeys
}

const reconcileBookings = async (tx: TripTransaction, tripId: string, list: ReconcilableBooking[]) => {
    const existing = await tx.select({ id: tripBooking.id }).from(tripBooking).where(eq(tripBooking.tripId, tripId))
    const removable = removableIds(existing, list)
    const removedKeys = removable.length > 0 ? await findAttachmentUploadKeys(tx, inArray(tripBookingAttachment.bookingId, removable)) : []
    if (removable.length > 0) await tx.delete(tripBooking).where(inArray(tripBooking.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = {
            title: item.title,
            whenLabel: item.whenLabel,
            priority: item.priority,
            linkLabel: item.linkLabel,
            linkUrl: item.linkUrl,
            actionNote: item.actionNote,
            planStatus: item.planStatus,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripBooking).set(values).where(eq(tripBooking.id, id))
            removedKeys.push(...(await reconcileBookingAttachments(tx, id, item.attachments)))
            continue
        }
        const bookingId = crypto.randomUUID()
        await tx.insert(tripBooking).values({ ...values, id: bookingId, tripId })
        await reconcileBookingAttachments(tx, bookingId, item.attachments)
    }
    return removedKeys
}

const reconcileInfoBlocks = async (tx: TripTransaction, sectionId: string, list: InfoBlockValues[]) => {
    const existing = await tx.select({ id: tripInfoBlock.id }).from(tripInfoBlock).where(eq(tripInfoBlock.sectionId, sectionId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripInfoBlock).where(inArray(tripInfoBlock.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = {
            kind: item.kind,
            emphasis: item.emphasis,
            text: item.text,
            linkLabel: item.linkLabel,
            linkUrl: item.linkUrl,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripInfoBlock).set(values).where(eq(tripInfoBlock.id, id))
            continue
        }
        await tx.insert(tripInfoBlock).values({ ...values, sectionId })
    }
}

const reconcileInfoSections = async (tx: TripTransaction, tripId: string, list: InfoSectionValues[]) => {
    const existing = await tx.select({ id: tripInfoSection.id }).from(tripInfoSection).where(eq(tripInfoSection.tripId, tripId))
    const removable = removableIds(existing, list)
    if (removable.length > 0) await tx.delete(tripInfoSection).where(inArray(tripInfoSection.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    for (const [index, item] of list.entries()) {
        const values = { title: item.title, isDefaultOpen: item.isDefaultOpen, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripInfoSection).set(values).where(eq(tripInfoSection.id, id))
            await reconcileInfoBlocks(tx, id, item.blocks)
            continue
        }
        const sectionId = crypto.randomUUID()
        await tx.insert(tripInfoSection).values({ ...values, id: sectionId, tripId })
        await reconcileInfoBlocks(tx, sectionId, item.blocks)
    }
}

const toScheduleKindValues = (kind: ScheduleKindValues | TripTemplate['scheduleKinds'][number], index: number) => ({
    key: kind.key,
    label: kind.label,
    legendLabel: kind.legendLabel,
    colorToken: kind.colorToken,
    bufferLabel: kind.bufferLabel,
    sortOrder: index,
})

const insertScheduleKinds = async (tx: TripTransaction, tripId: string, kinds: TripTemplate['scheduleKinds']) => {
    const kindIdByKey = new Map<string, string>()
    for (const [index, kind] of kinds.entries()) {
        const id = crypto.randomUUID()
        await tx.insert(tripScheduleKind).values({ ...toScheduleKindValues(kind, index), id, tripId })
        kindIdByKey.set(kind.key, id)
    }
    return kindIdByKey
}

const replaceScheduleKindUsage = async (tx: TripTransaction, removableId: string, replacementId: string | undefined, keptIds: Set<string>) => {
    const [used] = await tx.select({ id: tripScheduleItem.id }).from(tripScheduleItem).where(eq(tripScheduleItem.kindId, removableId)).limit(1)
    if (used === undefined) return
    if (replacementId === undefined || !keptIds.has(replacementId))
        throw new ApiError('VALIDATION_ERROR', '삭제하는 일정 종류를 대신할 종류를 골라 주세요.')
    await tx.update(tripScheduleItem).set({ kindId: replacementId }).where(eq(tripScheduleItem.kindId, removableId))
}

export const saveScheduleKinds = async (tripId: string, list: ScheduleKindValues[], replacements: Record<string, string>) => {
    await getDb().transaction(async (tx) => {
        const existing = await tx.select({ id: tripScheduleKind.id }).from(tripScheduleKind).where(eq(tripScheduleKind.tripId, tripId))
        const existingIds = new Set(existing.map((row) => row.id))
        const removable = removableIds(existing, list)
        const keptIds = new Set<string>()
        for (const [index, item] of list.entries()) {
            const values = toScheduleKindValues(item, index)
            const id = item.id
            if (id !== undefined && existingIds.has(id)) {
                await tx.update(tripScheduleKind).set(values).where(eq(tripScheduleKind.id, id))
                keptIds.add(id)
                continue
            }
            const insertedId = crypto.randomUUID()
            await tx.insert(tripScheduleKind).values({ ...values, id: insertedId, tripId })
            keptIds.add(insertedId)
        }
        for (const removableId of removable) await replaceScheduleKindUsage(tx, removableId, replacements[removableId], keptIds)
        if (removable.length > 0) await tx.delete(tripScheduleKind).where(inArray(tripScheduleKind.id, removable))
        await touchTrip(tx, tripId)
    })
}

export const findTripSummariesForUser = async (userId: string) => {
    const db = getDb()
    const memberTripIds = db.select({ tripId: tripMember.tripId }).from(tripMember).where(eq(tripMember.userId, userId))
    const rows = await db.query.trip.findMany({
        where: (fields, { eq: equals, or, inArray: within }) => or(equals(fields.ownerId, userId), within(fields.id, memberTripIds)),
        orderBy: (fields, { desc }) => [desc(fields.startDate), desc(fields.createdAt)],
        with: {
            members: { where: (fields, { eq: equals }) => equals(fields.userId, userId), columns: { role: true } },
            favorites: { where: (fields, { eq: equals }) => equals(fields.userId, userId), columns: { sortOrder: true } },
            destinations: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)], columns: { countryCode: true, city: true } },
            flights: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)], columns: { direction: true, departCode: true, arriveCode: true } },
            bookings: { columns: { id: true } },
            days: { columns: { id: true }, with: { scheduleItems: { columns: { id: true } } } },
        },
    })
    return rows.map(
        (row) =>
            ({
                id: row.id,
                title: row.title,
                eyebrow: row.eyebrow,
                destination: row.destination,
                departureAirportCode: row.departureAirportCode,
                startDate: row.startDate,
                endDate: row.endDate,
                customNights: row.customNights,
                customDays: row.customDays,
                periodNote: row.periodNote,
                role: resolveTripRole({ ownerId: row.ownerId, memberRole: row.members[0]?.role ?? null }, userId) ?? 'viewer',
                dayCount: row.days.length,
                scheduleCount: row.days.reduce((total, day) => total + day.scheduleItems.length, 0),
                bookingCount: row.bookings.length,
                updatedAt: row.updatedAt.toISOString(),
                isFavorite: row.favorites.length > 0,
                destinations: row.destinations,
                flights: row.flights,
            }) satisfies TripSummary,
    )
}

export const findTripDetail = async (tripId: string) => {
    const row = await getDb().query.trip.findFirst({
        where: (fields, { eq: equals }) => equals(fields.id, tripId),
        with: {
            owner: { columns: { id: true, name: true, username: true, image: true } },
            destinations: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
            flights: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
            lodgings: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
            sidebarLinks: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
            scheduleKinds: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
            bookings: {
                orderBy: (fields, { asc }) => [asc(fields.sortOrder)],
                with: { attachments: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] } },
            },
            infoSections: {
                orderBy: (fields, { asc }) => [asc(fields.sortOrder)],
                with: { blocks: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] } },
            },
            days: {
                orderBy: (fields, { asc }) => [asc(fields.dayIndex)],
                with: {
                    facts: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
                    routes: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
                    scheduleItems: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
                    notes: { orderBy: (fields, { asc }) => [asc(fields.sortOrder)] },
                },
            },
        },
    })
    if (!row) return null
    const { createdAt, updatedAt, ...rest } = row
    return { ...rest, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() } satisfies PublicTrip
}

export const findTripDetailForUser = async (tripId: string, userId: string) => {
    const detail = await findTripDetail(tripId)
    if (!detail) return null
    return { ...detail, viewerRole: await getTripRole(tripId, userId) } satisfies TripDetail
}

export const findPublicTripIdBySlug = async (slug: string) => {
    const row = await getDb().query.trip.findFirst({
        where: (fields, { and, eq: equals }) => and(equals(fields.shareSlug, slug), equals(fields.isPublic, true)),
        columns: { id: true },
    })
    return row?.id ?? null
}

export const findPublicTripBySlug = async (slug: string) => {
    const tripId = await findPublicTripIdBySlug(slug)
    if (tripId === null) return null
    return findTripDetail(tripId)
}

export const createTrip = async (ownerId: string, basics: TripBasicsValues, destinations: DestinationValues[]) => {
    const id = crypto.randomUUID()
    await getDb().transaction(async (tx) => {
        await tx.insert(trip).values({ ...toTripValues(basics), id, ownerId })
        await tx.insert(tripMember).values({ tripId: id, userId: ownerId, role: 'owner' })
        await insertScheduleKinds(tx, id, DEFAULT_SCHEDULE_KINDS)
        await reconcileDestinations(tx, id, destinations)
    })
    return { id } satisfies CreatedTrip
}

export const createTripFromTemplate = async (ownerId: string, template: TripTemplate) => {
    const id = crypto.randomUUID()
    await getDb().transaction(async (tx) => {
        await tx.insert(trip).values({ ...toTripValues(template), sidebarNote: template.sidebarNote, id, ownerId })
        await tx.insert(tripMember).values({ tripId: id, userId: ownerId, role: 'owner' })
        await reconcileDestinations(tx, id, template.destinations)
        await reconcileFlights(tx, id, template.flights)
        await reconcileLodgings(tx, id, template.lodgings)
        await reconcileSidebarLinks(tx, id, template.sidebarLinks)
        await insertTemplateDays(tx, id, template.days, await insertScheduleKinds(tx, id, template.scheduleKinds))
        await reconcileBookings(tx, id, template.bookings)
        await reconcileInfoSections(tx, id, template.infoSections)
    })
    return { id } satisfies CreatedTrip
}

export const replaceTripFromTemplate = async (tripId: string, template: TripTemplate) => {
    const removedKeys = await getDb().transaction(async (tx) => {
        await tx
            .update(trip)
            .set({ ...toTripValues(template), sidebarNote: template.sidebarNote })
            .where(eq(trip.id, tripId))
        await reconcileDestinations(tx, tripId, template.destinations)
        await reconcileFlights(tx, tripId, template.flights)
        await reconcileLodgings(tx, tripId, template.lodgings)
        await reconcileSidebarLinks(tx, tripId, template.sidebarLinks)
        await tx.delete(tripDay).where(eq(tripDay.tripId, tripId))
        await tx.delete(tripScheduleKind).where(eq(tripScheduleKind.tripId, tripId))
        await insertTemplateDays(tx, tripId, template.days, await insertScheduleKinds(tx, tripId, template.scheduleKinds))
        const keys = await reconcileBookings(tx, tripId, template.bookings)
        await reconcileInfoSections(tx, tripId, template.infoSections)
        return keys
    })
    await removeUploadedObjects(removedKeys)
    return { id: tripId } satisfies CreatedTrip
}

export const saveTripBasics = async (tripId: string, basics: TripBasicsValues, destinations: DestinationValues[]) => {
    await getDb().transaction(async (tx) => {
        await tx.update(trip).set(toTripValues(basics)).where(eq(trip.id, tripId))
        await reconcileDestinations(tx, tripId, destinations)
    })
}

export const deleteTrip = async (tripId: string) => {
    await getDb().delete(trip).where(eq(trip.id, tripId))
}

export const saveFlights = async (tripId: string, list: FlightValues[]) => {
    await getDb().transaction(async (tx) => {
        await reconcileFlights(tx, tripId, list)
        await touchTrip(tx, tripId)
    })
}

export const saveLodgings = async (tripId: string, list: LodgingValues[]) => {
    await getDb().transaction(async (tx) => {
        await reconcileLodgings(tx, tripId, list)
        await touchTrip(tx, tripId)
    })
}

export const saveSidebar = async (tripId: string, input: SidebarValues) => {
    await getDb().transaction(async (tx) => {
        await tx.update(trip).set({ sidebarNote: input.sidebarNote }).where(eq(trip.id, tripId))
        await reconcileSidebarLinks(tx, tripId, input.links)
        await touchTrip(tx, tripId)
    })
}

export const saveBookings = async (tripId: string, list: BookingValues[]) => {
    const removedKeys = await getDb().transaction(async (tx) => {
        const keys = await reconcileBookings(tx, tripId, list)
        await touchTrip(tx, tripId)
        return keys
    })
    await removeUploadedObjects(removedKeys)
}

export const saveInfoSections = async (tripId: string, list: InfoSectionValues[]) => {
    await getDb().transaction(async (tx) => {
        await reconcileInfoSections(tx, tripId, list)
        await touchTrip(tx, tripId)
    })
}

const slugifyDestination = (destination: string) => {
    const ascii = destination
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    return ascii.length > 0 ? ascii : FALLBACK_SLUG_BASE
}

const randomSlugSuffix = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(SHARE_SLUG_SUFFIX_LENGTH)), (byte) => (byte % BASE36_RADIX).toString(BASE36_RADIX)).join('')

const isSlugTaken = async (slug: string, tripId: string) => {
    const [row] = await getDb().select({ id: trip.id }).from(trip).where(eq(trip.shareSlug, slug))
    return row !== undefined && row.id !== tripId
}

const resolveShareSlug = async (tripId: string, current: { shareSlug: string | null; destination: string }, requested: string | undefined) => {
    if (requested !== undefined) {
        if (await isSlugTaken(requested, tripId)) throw new ApiError('VALIDATION_ERROR', '이미 사용 중인 공유 주소입니다.')
        return requested
    }
    if (current.shareSlug !== null) return current.shareSlug
    const base = slugifyDestination(current.destination)
    for (let attempt = 0; attempt < SHARE_SLUG_ATTEMPTS; attempt += 1) {
        const candidate = `${base}-${randomSlugSuffix()}`
        if (!(await isSlugTaken(candidate, tripId))) return candidate
    }
    throw new ApiError('INTERNAL_ERROR', '공유 주소를 생성하지 못했습니다.')
}

export const updateShareSettings = async (tripId: string, input: ShareSettingsValues) => {
    const db = getDb()
    const [current] = await db.select({ shareSlug: trip.shareSlug, destination: trip.destination }).from(trip).where(eq(trip.id, tripId))
    if (!current) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
    const slug = await resolveShareSlug(tripId, current, input.slug)
    await db.update(trip).set({ shareSlug: slug, isPublic: input.isPublic }).where(eq(trip.id, tripId))
    return { slug, isPublic: input.isPublic } satisfies ShareSettings
}

export const exportTripTemplate = async (tripId: string) => {
    const detail = await findTripDetail(tripId)
    if (!detail) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
    const kindKeyById = new Map(detail.scheduleKinds.map((kind) => [kind.id, kind.key]))
    return {
        title: detail.title,
        eyebrow: detail.eyebrow,
        destination: detail.destination,
        departureAirportCode: asAirportCode(detail.departureAirportCode),
        startDate: detail.startDate,
        endDate: detail.endDate,
        customNights: detail.customNights,
        customDays: detail.customDays,
        periodNote: detail.periodNote,
        disclaimer: detail.disclaimer,
        verifiedOn: detail.verifiedOn,
        bufferPolicy: detail.bufferPolicy,
        bookingNote: detail.bookingNote,
        footerNote: detail.footerNote,
        sidebarNote: detail.sidebarNote,
        destinations: detail.destinations.flatMap((item) =>
            isCountryCode(item.countryCode) ? [{ countryCode: item.countryCode, city: item.city }] : [],
        ),
        flights: detail.flights.map((item) => ({
            direction: item.direction,
            label: item.label,
            departCode: item.departCode,
            departTime: item.departTime,
            departTerminal: item.departTerminal,
            arriveCode: item.arriveCode,
            arriveTime: item.arriveTime,
            arriveTerminal: item.arriveTerminal,
            flightNumber: item.flightNumber,
            note: item.note,
        })),
        lodgings: detail.lodgings.map((item) => ({
            name: item.name,
            nameLocal: item.nameLocal,
            address: item.address,
            accessNote: item.accessNote,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            url: item.url,
            note: item.note,
        })),
        sidebarLinks: detail.sidebarLinks.map((link) => ({ label: link.label, url: link.url, description: link.description })),
        scheduleKinds: detail.scheduleKinds.map((kind) => ({
            key: kind.key,
            label: kind.label,
            legendLabel: kind.legendLabel,
            colorToken: kind.colorToken,
            bufferLabel: kind.bufferLabel,
        })),
        days: detail.days.map((day) => ({
            date: day.date,
            shortLabel: day.shortLabel,
            title: day.title,
            subtitle: day.subtitle,
            overview: day.overview,
            planHeadline: day.planHeadline,
            planNote: day.planNote,
            closingHeadline: day.closingHeadline,
            closingNote: day.closingNote,
            morningSummary: day.morningSummary,
            afternoonSummary: day.afternoonSummary,
            eveningSummary: day.eveningSummary,
            facts: day.facts.map((fact) => ({ label: fact.label, value: fact.value })),
            routes: day.routes.map((route) => ({
                origin: route.origin,
                destination: route.destination,
                minutes: route.minutes,
                pathText: route.pathText,
                formula: route.formula,
            })),
            scheduleItems: day.scheduleItems.map((item) => ({
                timeLabel: item.timeLabel,
                title: item.title,
                kind: kindKeyById.get(item.kindId) ?? DEFAULT_SCHEDULE_KIND_KEY,
                note: item.note,
                bufferNote: item.bufferNote,
                mapQuery: item.mapQuery,
            })),
            notes: day.notes.map((note) => ({ leading: note.leading, linkLabel: note.linkLabel, linkUrl: note.linkUrl, trailing: note.trailing })),
        })),
        bookings: detail.bookings.map((item) => ({
            title: item.title,
            whenLabel: item.whenLabel,
            priority: item.priority,
            linkLabel: item.linkLabel,
            linkUrl: item.linkUrl,
            actionNote: item.actionNote,
            planStatus: item.planStatus,
            attachments: item.attachments.map((attachment) => ({ kind: attachment.kind, url: attachment.url, label: attachment.label })),
        })),
        infoSections: detail.infoSections.map((section) => ({
            title: section.title,
            isDefaultOpen: section.isDefaultOpen,
            blocks: section.blocks.map((block) => ({
                kind: block.kind,
                emphasis: block.emphasis,
                text: block.text,
                linkLabel: block.linkLabel,
                linkUrl: block.linkUrl,
            })),
        })),
    } satisfies TripTemplate
}

export const findTripShareSlug = async (tripId: string) => {
    const [row] = await getDb().select({ shareSlug: trip.shareSlug }).from(trip).where(eq(trip.id, tripId))
    return row?.shareSlug ?? null
}
