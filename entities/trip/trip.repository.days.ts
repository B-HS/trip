import 'server-only'
import { and, desc, eq, inArray } from 'drizzle-orm'
import type { SavedDay, SavedRow, TripTransaction } from '@/entities/trip/trip.type'
import type { DayFactValues, DayNoteValues, DayValues, RouteValues, ScheduleItemValues } from '@/entities/trip/trip.validate'
import { getDb } from '@/shared/db/client'
import { trip, tripDay, tripDayFact, tripDayNote, tripRoute, tripScheduleItem } from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'

const FIRST_DAY_INDEX = 0

type DayFields = Omit<DayValues, 'id' | 'facts' | 'routes' | 'scheduleItems' | 'notes'>
type DayChildren = Pick<DayValues, 'facts' | 'routes' | 'scheduleItems' | 'notes'>

export const touchTrip = async (tx: TripTransaction, tripId: string) => {
    await tx.update(trip).set({ updatedAt: new Date() }).where(eq(trip.id, tripId))
}

export const removableIds = (existing: Array<{ id: string }>, items: Array<{ id?: string }>) => {
    const keep = new Set(items.map((item) => item.id).filter((value) => value !== undefined))
    return existing.filter((row) => !keep.has(row.id)).map((row) => row.id)
}

const toSavedRows = (ids: string[]) => ids.map((id) => ({ id }) satisfies SavedRow)

const toDayValues = (day: DayFields) => ({
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
})

const saveFacts = async (tx: TripTransaction, dayId: string, items: DayFactValues[]) => {
    const existing = await tx.select({ id: tripDayFact.id }).from(tripDayFact).where(eq(tripDayFact.dayId, dayId))
    const removable = removableIds(existing, items)
    if (removable.length > 0) await tx.delete(tripDayFact).where(inArray(tripDayFact.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    const savedIds: string[] = []
    for (const [index, item] of items.entries()) {
        const values = { label: item.label, value: item.value, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripDayFact).set(values).where(eq(tripDayFact.id, id))
            savedIds.push(id)
            continue
        }
        const insertedId = crypto.randomUUID()
        await tx.insert(tripDayFact).values({ ...values, id: insertedId, dayId })
        savedIds.push(insertedId)
    }
    return savedIds
}

const saveRoutes = async (tx: TripTransaction, dayId: string, items: RouteValues[]) => {
    const existing = await tx.select({ id: tripRoute.id }).from(tripRoute).where(eq(tripRoute.dayId, dayId))
    const removable = removableIds(existing, items)
    if (removable.length > 0) await tx.delete(tripRoute).where(inArray(tripRoute.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    const savedIds: string[] = []
    for (const [index, item] of items.entries()) {
        const values = {
            origin: item.origin,
            destination: item.destination,
            minutes: item.minutes,
            pathText: item.pathText,
            formula: item.formula,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripRoute).set(values).where(eq(tripRoute.id, id))
            savedIds.push(id)
            continue
        }
        const insertedId = crypto.randomUUID()
        await tx.insert(tripRoute).values({ ...values, id: insertedId, dayId })
        savedIds.push(insertedId)
    }
    return savedIds
}

const saveScheduleItems = async (tx: TripTransaction, dayId: string, items: ScheduleItemValues[]) => {
    const existing = await tx.select({ id: tripScheduleItem.id }).from(tripScheduleItem).where(eq(tripScheduleItem.dayId, dayId))
    const removable = removableIds(existing, items)
    if (removable.length > 0) await tx.delete(tripScheduleItem).where(inArray(tripScheduleItem.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    const savedIds: string[] = []
    for (const [index, item] of items.entries()) {
        const values = {
            timeLabel: item.timeLabel,
            title: item.title,
            kind: item.kind,
            note: item.note,
            bufferNote: item.bufferNote,
            mapQuery: item.mapQuery,
            sortOrder: index,
        }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripScheduleItem).set(values).where(eq(tripScheduleItem.id, id))
            savedIds.push(id)
            continue
        }
        const insertedId = crypto.randomUUID()
        await tx.insert(tripScheduleItem).values({ ...values, id: insertedId, dayId })
        savedIds.push(insertedId)
    }
    return savedIds
}

const saveDayNotes = async (tx: TripTransaction, dayId: string, items: DayNoteValues[]) => {
    const existing = await tx.select({ id: tripDayNote.id }).from(tripDayNote).where(eq(tripDayNote.dayId, dayId))
    const removable = removableIds(existing, items)
    if (removable.length > 0) await tx.delete(tripDayNote).where(inArray(tripDayNote.id, removable))
    const existingIds = new Set(existing.map((row) => row.id))
    const savedIds: string[] = []
    for (const [index, item] of items.entries()) {
        const values = { leading: item.leading, linkLabel: item.linkLabel, linkUrl: item.linkUrl, trailing: item.trailing, sortOrder: index }
        const id = item.id
        if (id !== undefined && existingIds.has(id)) {
            await tx.update(tripDayNote).set(values).where(eq(tripDayNote.id, id))
            savedIds.push(id)
            continue
        }
        const insertedId = crypto.randomUUID()
        await tx.insert(tripDayNote).values({ ...values, id: insertedId, dayId })
        savedIds.push(insertedId)
    }
    return savedIds
}

export const saveDayChildren = async (tx: TripTransaction, dayId: string, day: DayChildren) => ({
    facts: toSavedRows(await saveFacts(tx, dayId, day.facts)),
    routes: toSavedRows(await saveRoutes(tx, dayId, day.routes)),
    scheduleItems: toSavedRows(await saveScheduleItems(tx, dayId, day.scheduleItems)),
    notes: toSavedRows(await saveDayNotes(tx, dayId, day.notes)),
})

export const insertTemplateDays = async (tx: TripTransaction, tripId: string, days: Array<DayFields & DayChildren>) => {
    for (const [dayIndex, day] of days.entries()) {
        const id = crypto.randomUUID()
        await tx.insert(tripDay).values({ ...toDayValues(day), id, tripId, dayIndex })
        await saveDayChildren(tx, id, day)
    }
}

const upsertDay = async (tx: TripTransaction, tripId: string, input: DayValues) => {
    const values = toDayValues(input)
    const inputId = input.id
    if (inputId !== undefined) {
        const existing = await tx
            .select({ id: tripDay.id })
            .from(tripDay)
            .where(and(eq(tripDay.id, inputId), eq(tripDay.tripId, tripId)))
        if (existing.length > 0) {
            await tx.update(tripDay).set(values).where(eq(tripDay.id, inputId))
            return inputId
        }
    }
    const [last] = await tx
        .select({ dayIndex: tripDay.dayIndex })
        .from(tripDay)
        .where(eq(tripDay.tripId, tripId))
        .orderBy(desc(tripDay.dayIndex))
        .limit(1)
    const id = crypto.randomUUID()
    await tx.insert(tripDay).values({ ...values, id, tripId, dayIndex: last === undefined ? FIRST_DAY_INDEX : last.dayIndex + 1 })
    return id
}

export const saveDay = async (tripId: string, input: DayValues) =>
    getDb().transaction(async (tx) => {
        const dayId = await upsertDay(tx, tripId, input)
        const children = await saveDayChildren(tx, dayId, input)
        await touchTrip(tx, tripId)
        return { id: dayId, ...children } satisfies SavedDay
    })

export const deleteDay = async (tripId: string, dayId: string) => {
    await getDb().transaction(async (tx) => {
        await tx.delete(tripDay).where(and(eq(tripDay.id, dayId), eq(tripDay.tripId, tripId)))
        await touchTrip(tx, tripId)
    })
}

export const reorderDays = async (tripId: string, dayIds: string[]) => {
    await getDb().transaction(async (tx) => {
        const rows = await tx.select({ id: tripDay.id }).from(tripDay).where(eq(tripDay.tripId, tripId))
        const known = new Set(rows.map((row) => row.id))
        const ordered = dayIds.filter((dayId) => known.has(dayId))
        if (ordered.length !== rows.length) throw new ApiError('VALIDATION_ERROR', '일자 순서 정보가 올바르지 않습니다.')
        for (const [index, dayId] of ordered.entries()) {
            await tx
                .update(tripDay)
                .set({ dayIndex: -(index + 1) })
                .where(eq(tripDay.id, dayId))
        }
        for (const [index, dayId] of ordered.entries()) {
            await tx.update(tripDay).set({ dayIndex: index }).where(eq(tripDay.id, dayId))
        }
        await touchTrip(tx, tripId)
    })
}
