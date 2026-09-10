import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PublicProfile } from '@/entities/profile/profile.type'
import type { ProfileTab } from '@/entities/profile/profile.validate'
import { MOCK_EMPTY_TRIP_PAGE } from '@/tests/support/community-repository-mock'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('@/entities/profile/profile.repository', () => ({
    findPublicTripsByOwner: async () => MOCK_EMPTY_TRIP_PAGE,
    findLikedTrips: async () => MOCK_EMPTY_TRIP_PAGE,
}))

const { ProfilePage } = await import('@/widgets/profile/profile-page')

const FIRST_PAGE = 1

const PROFILE: PublicProfile = {
    id: 'user-1',
    name: '현석',
    username: 'hyunseok',
    image: null,
    bannerUrl: null,
    bio: null,
    points: 12,
    createdAt: '2026-01-05T00:00:00.000Z',
}

const renderProfile = async (tab: ProfileTab) =>
    render(await ProfilePage({ profile: PROFILE, username: 'hyunseok', tab, page: FIRST_PAGE, isOwner: false }))

afterEach(cleanup)

describe('ProfilePage', () => {
    test('탭 본문 섹션 헤더를 muted 스트립으로 올린다', async () => {
        await renderProfile('posts')

        expect(screen.getByRole('heading', { name: '작성한 글' }).parentElement?.className).toContain('bg-muted')
    })

    test('탭마다 본문 섹션 제목을 바꾼다', async () => {
        await renderProfile('likes')

        expect(screen.getByRole('heading', { name: '좋아요한 트립' })).toBeDefined()
        expect(screen.getByText('아직 좋아요한 트립이 없습니다.').className).toContain('bg-card')
    })
})
