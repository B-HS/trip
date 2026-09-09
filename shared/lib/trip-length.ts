import dayjs from 'dayjs'

const DAY_UNIT = 'day'
const NIGHTS_TO_DAYS_OFFSET = 1
const NIGHT_SUFFIX = '박'
const DAY_SUFFIX = '일'

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

export const formatTripLength = (source: TripLengthSource) => {
    const { nights, days } = resolveTripLength(source)
    return `${nights}${NIGHT_SUFFIX} ${days}${DAY_SUFFIX}`
}
