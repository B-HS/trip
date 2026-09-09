import type { TripDay } from '@/entities/trip/trip.type'

export const orderDaysByIds = <TDay extends Pick<TripDay, 'id' | 'dayIndex'>>(days: TDay[], dayIds: string[]) => {
    const dayById = new Map(days.map((day) => [day.id, day]))
    const ordered = dayIds.flatMap((dayId) => dayById.get(dayId) ?? [])
    const rest = days.filter((day) => !dayIds.includes(day.id))
    return [...ordered, ...rest].map((day, dayIndex) => ({ ...day, dayIndex }))
}
