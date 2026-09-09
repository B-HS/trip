import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { TripDayDetail, TripScheduleKind } from '@/entities/trip/trip.type'
import { DayPanel } from '@/features/trip-viewer/day-panel'

const SCHEDULE_KINDS: TripScheduleKind[] = [
    {
        id: 'kind-1',
        tripId: 'trip-1',
        key: 'planned',
        label: '계획',
        legendLabel: '계획 일정',
        colorToken: 'muted',
        bufferLabel: '마지막 10분 여유',
        sortOrder: 0,
    },
]

const DAY: TripDayDetail = {
    id: 'day-1',
    tripId: 'trip-1',
    dayIndex: 0,
    date: '2026-10-02',
    shortLabel: '히메지·코베',
    title: '히메지 · 키린 · 코베',
    subtitle: '10/2 금 · 산다역 14:30 셔틀',
    overview: '히메지성으로 이동합니다.',
    planHeadline: '14:15까지 산다역 도착',
    planNote: '점심은 산다역 근처에서 먹습니다.',
    closingHeadline: '숙소 도착은 22:00 전후',
    closingNote: '지연 가능성이 있습니다.',
    morningSummary: '히메지성',
    afternoonSummary: '키린 코베공장',
    eveningSummary: '포트타워',
    facts: [{ id: 'fact-1', dayId: 'day-1', sortOrder: 0, label: '출발 공항', value: 'ICN' }],
    routes: [
        {
            id: 'route-1',
            dayId: 'day-1',
            sortOrder: 0,
            origin: '숙소',
            destination: '히메지성',
            minutes: 110,
            pathText: 'JR 신쾌속',
            formula: '승차 70분 + 도보 30분',
        },
    ],
    scheduleItems: [
        {
            id: 'item-1',
            dayId: 'day-1',
            sortOrder: 0,
            timeLabel: '09:00~11:00',
            title: '히메지성',
            kindId: 'kind-1',
            note: null,
            bufferNote: null,
            mapQuery: 'Himeji Castle',
        },
    ],
    notes: [
        {
            id: 'note-1',
            dayId: 'day-1',
            sortOrder: 0,
            leading: '공식 안내',
            linkLabel: '히메지성',
            linkUrl: 'https://example.com',
            trailing: ': 확인',
        },
    ],
}

afterEach(cleanup)

describe('DayPanel', () => {
    test('날짜 패널을 렌더한다', () => {
        render(
            <DayPanel
                day={DAY}
                scheduleKinds={SCHEDULE_KINDS}
                dayIndex={0}
                panelId='panel'
                checkedItemIds={['item-1']}
                isHideCompleted={false}
                isCheckable
            />,
        )

        expect(screen.getByRole('heading', { name: '히메지 · 키린 · 코베' })).toBeDefined()
        expect(screen.getByText('01')).toBeDefined()
        expect(screen.getByRole('button', { name: '이동시간 계산' })).toBeDefined()
        expect(screen.getByText('1 / 1 완료')).toBeDefined()
        expect(screen.getByRole('button', { name: '완료 숨기기' })).toBeDefined()
        expect(screen.getByLabelText('이날 메모')).toBeDefined()
        expect(screen.getByText('확인된 내용')).toBeDefined()
    })

    test('완료 숨기기 상태면 완료된 행을 숨긴다', () => {
        render(
            <DayPanel
                day={DAY}
                scheduleKinds={SCHEDULE_KINDS}
                dayIndex={0}
                panelId='panel'
                checkedItemIds={['item-1']}
                isHideCompleted
                isCheckable
            />,
        )

        expect(screen.queryByRole('checkbox')).toBeNull()
        expect(screen.getByText('1 / 1 완료')).toBeDefined()
    })

    test('인쇄 레이아웃에서는 도구와 메모를 감춘다', () => {
        render(
            <DayPanel
                day={DAY}
                scheduleKinds={SCHEDULE_KINDS}
                dayIndex={0}
                panelId='panel'
                checkedItemIds={[]}
                isHideCompleted={false}
                isCheckable
                isPrintLayout
            />,
        )

        expect(screen.queryByRole('button', { name: '완료 숨기기' })).toBeNull()
        expect(screen.queryByLabelText('이날 메모')).toBeNull()
        expect(screen.getByRole('heading', { name: '이동시간 계산' })).toBeDefined()
    })
})
