import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { TripCardProps } from '@/features/trips/trip-card'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

const Passthrough = ({ children }: PropsWithChildren) => <div>{children}</div>

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('@/shared/ui/dropdown-menu', () => ({
    DropdownMenu: Passthrough,
    DropdownMenuTrigger: Passthrough,
    DropdownMenuContent: Passthrough,
    DropdownMenuItem: Passthrough,
    DropdownMenuSeparator: () => null,
}))

const { TripCard } = await import('@/features/trips/trip-card')

const BASE_PROPS: TripCardProps = {
    tripId: 'trip-1',
    title: '오사카 여행 노트',
    eyebrow: 'KANSAI / OCTOBER 2026',
    destination: '오사카',
    dateRangeLabel: '2026.10.01 – 10.07 (목–수)',
    routeLabel: 'ICN → KIX',
    status: { tone: 'upcoming', label: '예정 D-22' },
    roleLabel: '소유자',
    dayCount: 7,
    scheduleCount: 65,
    bookingCount: 9,
    canEdit: true,
    canDelete: true,
    onDelete: () => {},
}

afterEach(cleanup)

describe('TripCard', () => {
    test('제목·목적지·기간·역할을 표시한다', () => {
        render(<TripCard {...BASE_PROPS} />)

        expect(screen.getByRole('heading', { name: '오사카 여행 노트' })).toBeDefined()
        expect(screen.getByText('오사카')).toBeDefined()
        expect(screen.getByText('2026.10.01 – 10.07 (목–수)')).toBeDefined()
        expect(screen.getByText('소유자')).toBeDefined()
        expect(screen.getByText('예정 D-22')).toBeDefined()
    })

    test('카드 전체가 상세 링크를 가리킨다', () => {
        render(<TripCard {...BASE_PROPS} />)

        expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toContain('/trips/trip-1')
    })

    test('소유자에게는 편집과 삭제 항목이 보인다', () => {
        render(<TripCard {...BASE_PROPS} />)

        expect(screen.getByText('편집')).toBeDefined()
        expect(screen.getByText('삭제')).toBeDefined()
    })

    test('열람자에게는 편집과 삭제 항목이 보이지 않는다', () => {
        render(<TripCard {...BASE_PROPS} roleLabel='열람자' canEdit={false} canDelete={false} />)

        expect(screen.queryByText('편집')).toBeNull()
        expect(screen.queryByText('삭제')).toBeNull()
        expect(screen.getByText('열람자')).toBeDefined()
    })

    test('상태가 없으면 상태 배지를 그리지 않는다', () => {
        render(<TripCard {...BASE_PROPS} status={null} />)

        expect(screen.queryByText('예정 D-22')).toBeNull()
    })
})
