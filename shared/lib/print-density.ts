import type { TripDayDetail } from '@/entities/trip/trip.type'

export type PrintDensity = 'regular' | 'compact' | 'tight'

const COMPACT_SCORE = 10
// The model template's normal days score 12–15. Keep those days on one A4
// sheet; only unusually dense custom days should need the tightest scale.
const TIGHT_SCORE = 12

const dayTextWeight = (day: TripDayDetail) =>
    [day.overview, day.planHeadline, day.planNote, day.closingHeadline, day.closingNote].reduce(
        (score, value) => score + (value === null || value.length < 80 ? 0 : 1),
        0,
    )

/**
 * Print pages use a bounded density fallback for unusually full days. The
 * fallback changes spacing/type scale only; it never hides or clips content.
 */
export const getPrintDensity = (day: TripDayDetail): PrintDensity => {
    const score = day.scheduleItems.length + day.facts.length + day.routes.length + day.notes.length + dayTextWeight(day)

    if (score >= TIGHT_SCORE) return 'tight'
    if (score >= COMPACT_SCORE) return 'compact'
    return 'regular'
}
