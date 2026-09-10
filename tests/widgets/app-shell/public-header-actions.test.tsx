import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

type SessionSnapshot = {
    data: { user: { id: string } } | null
    isPending: boolean
}

const PENDING_SESSION: SessionSnapshot = { data: null, isPending: true }
const GUEST_SESSION: SessionSnapshot = { data: null, isPending: false }
const SIGNED_IN_SESSION: SessionSnapshot = { data: { user: { id: 'user-1' } }, isPending: false }

let sessionSnapshot: SessionSnapshot = PENDING_SESSION

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('@/shared/lib/auth-client', () => ({ useSession: () => sessionSnapshot }))

const { PublicHeaderActions } = await import('@/widgets/app-shell/public-header-actions')

const renderActions = (snapshot: SessionSnapshot) => {
    sessionSnapshot = snapshot
    return render(<PublicHeaderActions />)
}

afterEach(cleanup)

describe('PublicHeaderActions', () => {
    test('세션을 기다리는 동안에도 탐색과 게시판 셀을 그린다', () => {
        renderActions(PENDING_SESSION)

        expect(screen.getByRole('link', { name: '탐색' }).getAttribute('href')).toBe('/explore')
        expect(screen.getByRole('link', { name: '게시판' }).getAttribute('href')).toBe('/boards')
    })

    test('세션을 기다리는 동안에는 로그인과 홈 어느 쪽도 그리지 않는다', () => {
        renderActions(PENDING_SESSION)

        expect(screen.queryByRole('link', { name: '로그인' })).toBeNull()
        expect(screen.queryByRole('link', { name: '시작하기' })).toBeNull()
        expect(screen.queryByRole('link', { name: '홈' })).toBeNull()
    })

    test('비로그인이면 로그인과 시작하기를 함께 그린다', () => {
        renderActions(GUEST_SESSION)

        expect(screen.getByRole('link', { name: '탐색' })).toBeDefined()
        expect(screen.getByRole('link', { name: '게시판' })).toBeDefined()
        expect(screen.getByRole('link', { name: '로그인' }).getAttribute('href')).toBe('/login')
        expect(screen.getByRole('link', { name: '시작하기' }).getAttribute('href')).toBe('/signup')
    })

    test('로그인 상태면 로그인 대신 홈으로 바꾼다', () => {
        renderActions(SIGNED_IN_SESSION)

        expect(screen.getByRole('link', { name: '탐색' })).toBeDefined()
        expect(screen.getByRole('link', { name: '게시판' })).toBeDefined()
        expect(screen.getByRole('link', { name: '홈' }).getAttribute('href')).toBe('/')
        expect(screen.queryByRole('link', { name: '로그인' })).toBeNull()
        expect(screen.queryByRole('link', { name: '시작하기' })).toBeNull()
    })
})
