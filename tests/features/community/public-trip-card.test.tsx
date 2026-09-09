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

const { PublicTripCard } = await import('@/features/community/public-trip-card')

const BASE_TRIP: PublicTripCardItem = {
    id: 'trip-1',
    title: '오사카 여행 노트',
    eyebrow: 'KANSAI / OCTOBER 2026',
    destination: '오사카',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    customNights: null,
    customDays: null,
    periodNote: null,
    likeCount: 7,
    shareSlug: 'osaka-2026',
    owner: { id: 'user-1', name: '현석', username: 'hyunseok', image: null },
    destinations: [{ countryCode: 'JP', city: '오사카' }],
    flights: [
        { direction: 'inbound', departCode: 'KIX', arriveCode: 'ICN' },
        { direction: 'outbound', departCode: 'ICN', arriveCode: 'KIX' },
    ],
    updatedAt: '2026-09-09T00:00:00.000Z',
}

afterEach(cleanup)

describe('PublicTripCard', () => {
    test('제목 링크가 공개 트립 주소를 가리킨다', () => {
        render(<PublicTripCard trip={BASE_TRIP} />)

        expect(screen.getByRole('link', { name: '오사카 여행 노트' }).getAttribute('href')).toBe('/s/osaka-2026')
    })

    test('기간과 여행 길이를 한 줄로 보여준다', () => {
        render(<PublicTripCard trip={BASE_TRIP} />)

        expect(screen.getByText('2026.10.01 – 10.07 (목–수) · 6박 7일')).toBeDefined()
    })

    test('출국 항공편으로 경로 라벨을 만든다', () => {
        render(<PublicTripCard trip={BASE_TRIP} />)

        expect(screen.getByText('ICN → KIX')).toBeDefined()
    })

    test('항공편이 없으면 경로 라벨을 그리지 않는다', () => {
        render(<PublicTripCard trip={{ ...BASE_TRIP, flights: [] }} />)

        expect(screen.queryByText('ICN → KIX')).toBeNull()
    })

    test('머리말과 목적지, 소유자, 좋아요 수를 보여준다', () => {
        render(<PublicTripCard trip={BASE_TRIP} />)

        expect(screen.getByText('KANSAI / OCTOBER 2026')).toBeDefined()
        expect(screen.getByText('JP')).toBeDefined()
        expect(screen.getByRole('link', { name: '현석' }).getAttribute('href')).toBe('/u/hyunseok')
        expect(screen.getByText('7')).toBeDefined()
    })

    test('머리말이 없으면 머리말 줄을 그리지 않는다', () => {
        render(<PublicTripCard trip={{ ...BASE_TRIP, eyebrow: null }} />)

        expect(screen.queryByText('KANSAI / OCTOBER 2026')).toBeNull()
    })
})
