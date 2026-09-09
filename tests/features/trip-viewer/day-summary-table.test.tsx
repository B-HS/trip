import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { DaySummaryTable, type DaySummaryRow } from '@/features/trip-viewer/day-summary-table'

const DAY_COUNT = 7
const HEADER_ROW_COUNT = 1
const EMPTY_VALUE = '—'

const buildDays = (): DaySummaryRow[] =>
    Array.from({ length: DAY_COUNT }, (_, index) => ({
        id: `day-${index}`,
        date: `2026-10-0${index + 1}`,
        morningSummary: index === DAY_COUNT - 1 ? null : `오전 ${index}`,
        afternoonSummary: index === DAY_COUNT - 1 ? null : `오후 ${index}`,
        eveningSummary: index === DAY_COUNT - 1 ? null : `저녁 ${index}`,
    }))

afterEach(cleanup)

describe('DaySummaryTable', () => {
    test('머리글과 날짜 수만큼 행을 그린다', () => {
        render(<DaySummaryTable days={buildDays()} />)

        expect(screen.getAllByRole('row')).toHaveLength(DAY_COUNT + HEADER_ROW_COUNT)
        expect(screen.getByRole('columnheader', { name: '날짜' })).toBeDefined()
        expect(screen.getByRole('columnheader', { name: '오전' })).toBeDefined()
        expect(screen.getByRole('columnheader', { name: '오후' })).toBeDefined()
        expect(screen.getByRole('columnheader', { name: '저녁' })).toBeDefined()
    })

    test('요약이 없는 칸은 대체 문자로 채운다', () => {
        render(<DaySummaryTable days={buildDays()} />)

        expect(screen.getAllByText(EMPTY_VALUE)).toHaveLength(3)
    })

    test('날짜를 요일과 함께 표시한다', () => {
        render(<DaySummaryTable days={buildDays()} />)

        expect(screen.getByText('10/1 목')).toBeDefined()
        expect(screen.getByText('10/7 수')).toBeDefined()
    })
})
