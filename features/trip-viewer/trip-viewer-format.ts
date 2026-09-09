import dayjs from 'dayjs'
import 'dayjs/locale/ko'

const KOREAN_LOCALE = 'ko'
const DAY_NUMBER_LENGTH = 2
const DAY_NUMBER_PAD = '0'
const FULL_PERCENT = 100
const EMPTY_VALUE = '—'

export const formatMonthDay = (date: string) => dayjs(date).format('MM.DD')

export const formatDateWithWeekday = (date: string) => dayjs(date).locale(KOREAN_LOCALE).format('M/D ddd')

export const formatVerifiedOn = (date: string) => dayjs(date).format('YYYY.MM.DD')

export const formatDayNumber = (dayIndex: number) => String(dayIndex + 1).padStart(DAY_NUMBER_LENGTH, DAY_NUMBER_PAD)

export const formatPeriodLabel = (startDate: string, endDate: string) => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    if (start.isSame(end, 'month')) return `${start.format('M월 D일')} — ${end.format('D일')}`
    return `${start.format('M월 D일')} — ${end.format('M월 D일')}`
}

export const formatRatio = (completed: number, total: number) => `${completed} / ${total}`

export const formatSummary = (value: string | null) => value ?? EMPTY_VALUE

export const toPercent = (completed: number, total: number) => (total === 0 ? 0 : (completed / total) * FULL_PERCENT)
