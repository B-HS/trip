import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PublicTripCard as PublicTripCardItem } from '@/entities/trip/trip.type'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { PublicTripGrid } = await import('@/features/community/public-trip-grid')

const EMPTY_LABEL = '공개된 트립이 없습니다'

const buildTrip = (id: string): PublicTripCardItem => ({
    id,
    title: `트립 ${id}`,
    eyebrow: null,
    destination: '오사카',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    customNights: null,
    customDays: null,
    periodNote: null,
    likeCount: 0,
    shareSlug: `slug-${id}`,
    owner: { id: 'user-1', name: '현석', username: 'hyunseok', image: null },
    destinations: [{ countryCode: 'JP', city: '오사카' }],
    flights: [],
    updatedAt: '2026-09-09T00:00:00.000Z',
})

afterEach(cleanup)

describe('PublicTripGrid', () => {
    test('카드 수에 맞춰 폭을 채우는 auto-fit 열을 쓴다', () => {
        const { container } = render(<PublicTripGrid trips={[buildTrip('a')]} emptyLabel={EMPTY_LABEL} />)
        const grid = container.querySelector('ul')

        expect(grid?.className).toContain('grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]')
        expect(grid?.className).not.toContain('grid-cols-1')
        expect(grid?.className).not.toContain('sm:grid-cols-2')
        expect(grid?.className).not.toContain('lg:grid-cols-3')
    })

    test('카드가 하나면 빈 열을 채우는 블록을 그리지 않는다', () => {
        const { container } = render(<PublicTripGrid trips={[buildTrip('a')]} emptyLabel={EMPTY_LABEL} />)
        const grid = container.querySelector('ul')

        expect(grid?.childElementCount).toBe(1)
        expect(grid?.querySelectorAll(':scope > [aria-hidden]').length).toBe(0)
    })

    test('트립마다 항목을 하나씩 그린다', () => {
        const { container } = render(<PublicTripGrid trips={[buildTrip('a'), buildTrip('b')]} emptyLabel={EMPTY_LABEL} />)

        expect(container.querySelector('ul')?.childElementCount).toBe(2)
    })

    test('트립이 없으면 빈 상태 문구만 보여준다', () => {
        const { container } = render(<PublicTripGrid trips={[]} emptyLabel={EMPTY_LABEL} />)

        expect(screen.getByText(EMPTY_LABEL)).toBeDefined()
        expect(container.querySelector('ul')).toBeNull()
    })
})
