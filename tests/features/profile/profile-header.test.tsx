import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PublicProfile } from '@/entities/profile/profile.type'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { ProfileHeader } = await import('@/features/profile/profile-header')

const BASE_PROFILE: PublicProfile = {
    id: 'user-1',
    name: '현석',
    username: 'hyunseok',
    image: null,
    bannerUrl: null,
    bio: '여행 일정을 기록합니다.',
    points: 12,
    createdAt: '2026-01-05T00:00:00.000Z',
}

afterEach(cleanup)

describe('ProfileHeader', () => {
    test('표시 이름과 사용자명, 소개를 보여준다', () => {
        render(<ProfileHeader profile={BASE_PROFILE} username='hyunseok' isOwner={false} />)

        expect(screen.getByRole('heading', { name: '현석' })).toBeDefined()
        expect(screen.getByText('@hyunseok')).toBeDefined()
        expect(screen.getByText('여행 일정을 기록합니다.')).toBeDefined()
    })

    test('소개가 없으면 문단을 만들지 않는다', () => {
        render(<ProfileHeader profile={{ ...BASE_PROFILE, bio: null }} username='hyunseok' isOwner={false} />)

        expect(screen.queryByText('여행 일정을 기록합니다.')).toBeNull()
    })

    test('포인트와 가입일 타일을 보여준다', () => {
        render(<ProfileHeader profile={BASE_PROFILE} username='hyunseok' isOwner={false} />)

        expect(screen.getByText('포인트')).toBeDefined()
        expect(screen.getByText('12')).toBeDefined()
        expect(screen.getByText('가입일')).toBeDefined()
        expect(screen.getByText('2026.01.05')).toBeDefined()
    })

    test('남의 프로필에는 프로필 설정 셀이 없다', () => {
        render(<ProfileHeader profile={BASE_PROFILE} username='hyunseok' isOwner={false} />)

        expect(screen.queryByRole('link', { name: '프로필 설정' })).toBeNull()
    })

    test('내 프로필에는 프로필 설정 셀을 보여준다', () => {
        render(<ProfileHeader profile={BASE_PROFILE} username='hyunseok' isOwner />)

        expect(screen.getByRole('link', { name: '프로필 설정' }).getAttribute('href')).toBe('/settings/profile')
    })
})
