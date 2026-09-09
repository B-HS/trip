import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { ProfileTabs } = await import('@/features/profile/profile-tabs')

afterEach(cleanup)

describe('ProfileTabs', () => {
    test('세 탭을 현재 주소 기준 검색 파라미터로 연결한다', () => {
        render(<ProfileTabs activeTab='posts' />)

        expect(screen.getByRole('link', { name: '글' }).getAttribute('href')).toBe('?tab=posts')
        expect(screen.getByRole('link', { name: '공개 트립' }).getAttribute('href')).toBe('?tab=trips')
        expect(screen.getByRole('link', { name: '좋아요한 트립' }).getAttribute('href')).toBe('?tab=likes')
    })

    test('현재 탭만 현재 페이지로 표시한다', () => {
        render(<ProfileTabs activeTab='likes' />)

        expect(screen.getByRole('link', { name: '좋아요한 트립' }).getAttribute('aria-current')).toBe('page')
        expect(screen.getByRole('link', { name: '글' }).getAttribute('aria-current')).toBeNull()
    })

    test('탭 묶음에 이름을 붙인다', () => {
        render(<ProfileTabs activeTab='posts' />)

        expect(screen.getByRole('navigation', { name: '프로필 탭' })).toBeDefined()
    })
})
