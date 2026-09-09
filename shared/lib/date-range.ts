import dayjs from 'dayjs'

const DATE_FORMAT = 'YYYY-MM-DD'
const DAY_UNIT = 'day'
const MONTH_UNIT = 'month'
const MONDAY_SHIFT = 6
const DAYS_IN_WEEK = 7
const LAST_WEEKDAY_OFFSET = 6

export const weekRange = (today: string) => {
    const base = dayjs(today)
    const start = base.subtract((base.day() + MONDAY_SHIFT) % DAYS_IN_WEEK, DAY_UNIT)
    return { start: start.format(DATE_FORMAT), end: start.add(LAST_WEEKDAY_OFFSET, DAY_UNIT).format(DATE_FORMAT) }
}

export const monthRange = (today: string) => {
    const base = dayjs(today)
    return { start: base.startOf(MONTH_UNIT).format(DATE_FORMAT), end: base.endOf(MONTH_UNIT).format(DATE_FORMAT) }
}
