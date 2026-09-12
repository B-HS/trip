import dayjs from 'dayjs'
import 'dayjs/locale/ko'
const DAY_NUMBER_LENGTH = 2
const DAY_NUMBER_PAD = '0'
const FULL_PERCENT = 100
const EMPTY_VALUE = '—'

export const formatMonthDay = (date: string) => dayjs(date).format('MM.DD')

export const formatDateWithWeekday = (date: string, locale = 'ko') =>
    locale === 'ko'
        ? dayjs(date).locale('ko').format('M/D ddd')
        : new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric', weekday: 'short' }).format(dayjs(date).toDate())

export const formatVerifiedOn = (date: string) => dayjs(date).format('YYYY.MM.DD')

export const formatDayNumber = (dayIndex: number) => String(dayIndex + 1).padStart(DAY_NUMBER_LENGTH, DAY_NUMBER_PAD)

export const formatPeriodLabel = (startDate: string, endDate: string, locale = 'ko') => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    if (locale === 'ko') {
        if (start.isSame(end, 'month')) return `${start.format('M월 D일')} — ${end.format('D일')}`
        return `${start.format('M월 D일')} — ${end.format('M월 D일')}`
    }
    const monthDay = (value: dayjs.Dayjs) => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(value.toDate())
    return `${monthDay(start)} — ${monthDay(end)}`
}

export const formatRatio = (completed: number, total: number) => `${completed} / ${total}`

export const formatSummary = (value: string | null) => value ?? EMPTY_VALUE

export const toPercent = (completed: number, total: number) => (total === 0 ? 0 : (completed / total) * FULL_PERCENT)
