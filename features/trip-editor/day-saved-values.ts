import type { SavedDay, SavedRow } from '@/entities/trip/trip.type'
import type { DayInput, DayValues } from '@/entities/trip/trip.validate'

const withSavedIds = <TItem>(items: TItem[], savedRows: SavedRow[]) => items.map((item, index) => ({ ...item, id: savedRows[index]?.id }))

export const toSavedDayValues = (values: DayValues, saved: SavedDay) =>
    ({
        ...values,
        id: saved.id,
        facts: withSavedIds(values.facts, saved.facts),
        routes: withSavedIds(values.routes, saved.routes),
        scheduleItems: withSavedIds(values.scheduleItems, saved.scheduleItems),
        notes: withSavedIds(values.notes, saved.notes),
    }) satisfies DayInput
