import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { TripScheduleKind } from '@/entities/trip/trip.type'
import { TripLegend } from '@/features/trip-viewer/legend'

const KINDS: TripScheduleKind[] = [
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
    {
        id: 'kind-2',
        tripId: 'trip-1',
        key: 'festival',
        label: '축제',
        legendLabel: '축제·야간 개장',
        colorToken: 'chart-3',
        bufferLabel: null,
        sortOrder: 1,
    },
]

afterEach(cleanup)

describe('TripLegend', () => {
    test('트립의 종류 목록을 순서대로 그린다', () => {
        render(<TripLegend kinds={KINDS} />)

        expect(screen.getByText('계획 일정')).toBeDefined()
        expect(screen.getByText('축제·야간 개장')).toBeDefined()
    })

    test('색 토큰에 맞는 스와치 클래스를 쓴다', () => {
        const { container } = render(<TripLegend kinds={KINDS} />)
        const swatches = container.querySelectorAll('span[aria-hidden]')

        expect(swatches[0]?.className).toContain('bg-muted-foreground')
        expect(swatches[1]?.className).toContain('bg-chart-3')
    })
})
