import dayjs from 'dayjs'
import 'dayjs/locale/ko'

const DATE_LOCALE = 'ko'
const START_FORMAT = 'YYYY.MM.DD'
const END_FORMAT = 'MM.DD'
const WEEKDAY_FORMAT = 'dd'
const RANGE_SEPARATOR = ' – '
const WEEKDAY_SEPARATOR = '–'

export type TripDateRangeSource = {
    startDate: string
    endDate: string
}

export const formatTripDateRange = ({ startDate, endDate }: TripDateRangeSource) => {
    const start = dayjs(startDate).locale(DATE_LOCALE)
    const end = dayjs(endDate).locale(DATE_LOCALE)
    const weekdays = `${start.format(WEEKDAY_FORMAT)}${WEEKDAY_SEPARATOR}${end.format(WEEKDAY_FORMAT)}`
    return `${start.format(START_FORMAT)}${RANGE_SEPARATOR}${end.format(END_FORMAT)} (${weekdays})`
}
