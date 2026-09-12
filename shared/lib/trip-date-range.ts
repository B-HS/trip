import dayjs from 'dayjs'
import 'dayjs/locale/ko'
const RANGE_SEPARATOR = ' – '

export type TripDateRangeSource = {
    startDate: string
    endDate: string
}

export const formatTripDateRange = ({ startDate, endDate }: TripDateRangeSource, locale = 'ko') => {
    if (locale === 'ko') {
        const start = dayjs(startDate).locale('ko')
        const end = dayjs(endDate).locale('ko')
        return `${start.format('YYYY.MM.DD')}${RANGE_SEPARATOR}${end.format('MM.DD')} (${start.format('dd')}–${end.format('dd')})`
    }
    const start = dayjs(startDate).toDate()
    const end = dayjs(endDate).toDate()
    const startLabel = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).format(start)
    const endLabel = new Intl.DateTimeFormat(locale, { month: '2-digit', day: '2-digit', weekday: 'short' }).format(end)
    return `${startLabel}${RANGE_SEPARATOR}${endLabel}`
}
