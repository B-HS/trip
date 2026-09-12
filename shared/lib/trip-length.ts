import dayjs from 'dayjs'

const DAY_UNIT = 'day'
const NIGHTS_TO_DAYS_OFFSET = 1

export type TripLengthSource = {
    startDate: string
    endDate: string
    nights: number | null
    days: number | null
}

export const resolveTripLength = ({ startDate, endDate, nights, days }: TripLengthSource) => {
    if (nights !== null && days !== null) return { nights, days }
    const autoNights = dayjs(endDate).diff(dayjs(startDate), DAY_UNIT)
    return { nights: autoNights, days: autoNights + NIGHTS_TO_DAYS_OFFSET }
}

export const formatTripLength = (source: TripLengthSource, locale = 'ko') => {
    const { nights, days } = resolveTripLength(source)
    if (locale === 'en') return `${nights} nights ${days} days`
    if (locale === 'ja') return `${nights}泊 ${days}日`
    return `${nights}박 ${days}일`
}
