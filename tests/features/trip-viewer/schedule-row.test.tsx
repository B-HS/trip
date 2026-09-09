import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import type { TripScheduleItem } from '@/entities/trip/trip.type'

type MotionStubProps = PropsWithChildren<{ className?: string }>

const MotionListItem = ({ className, children }: MotionStubProps) => <li className={className}>{children}</li>
const MotionDiv = ({ className, children }: MotionStubProps) => <div className={className}>{children}</div>

mock.module('motion/react', () => ({
    motion: { li: MotionListItem, div: MotionDiv },
    AnimatePresence: ({ children }: PropsWithChildren) => children,
}))

const { ScheduleRow } = await import('@/features/trip-viewer/schedule-row')

const BASE_ITEM: TripScheduleItem = {
    id: 'item-1',
    dayId: 'day-1',
    sortOrder: 0,
    timeLabel: '09:00~11:00',
    title: '히메지성',
    kind: 'confirmed',
    note: '2시간, 코코엔 별도 관람 제외',
    bufferNote: null,
    mapQuery: 'Himeji Castle',
}

const renderRow = (item: TripScheduleItem, isCompleted = false, isCheckable = true) =>
    render(
        <ul>
            <ScheduleRow item={item} isCompleted={isCompleted} isCheckable={isCheckable} />
        </ul>,
    )

afterEach(cleanup)

describe('ScheduleRow', () => {
    test('종류에 맞는 배지와 여유 문구를 표시한다', () => {
        renderRow(BASE_ITEM)

        expect(screen.getByText('확정 시각')).toBeDefined()
        expect(screen.getByText('전후 여유 10분')).toBeDefined()
    })

    test('bufferNote 가 있으면 기본 여유 문구를 덮어쓴다', () => {
        renderRow({ ...BASE_ITEM, kind: 'target', bufferNote: '셔틀 시각 고정' })

        expect(screen.getByText('예매 목표')).toBeDefined()
        expect(screen.getByText('셔틀 시각 고정')).toBeDefined()
    })

    test('mapQuery 로 지도 링크를 만든다', () => {
        renderRow(BASE_ITEM)

        const link = screen.getByRole('link', { name: '히메지성 Google 지도에서 열기' })

        expect(link.getAttribute('href')).toBe('https://www.google.com/maps/search/?api=1&query=Himeji%20Castle')
        expect(link.getAttribute('target')).toBe('_blank')
    })

    test('mapQuery 가 없으면 지도 링크를 그리지 않는다', () => {
        renderRow({ ...BASE_ITEM, mapQuery: null })

        expect(screen.queryByRole('link')).toBeNull()
    })

    test('완료 상태면 취소선을 적용하고 체크박스를 체크한다', () => {
        const { container } = renderRow(BASE_ITEM, true)

        expect(screen.getByRole('checkbox', { name: '09:00~11:00 히메지성 완료' }).getAttribute('data-state')).toBe('checked')
        expect(container.querySelector('label')?.className).toContain('line-through')
    })

    test('체크할 수 없으면 체크박스를 그리지 않는다', () => {
        renderRow(BASE_ITEM, false, false)

        expect(screen.queryByRole('checkbox')).toBeNull()
    })
})
