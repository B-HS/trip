import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

const Passthrough = ({ children }: PropsWithChildren) => <div>{children}</div>

type SessionSnapshot = {
    data: { user: { id: string } } | null
    isPending: boolean
}

const PENDING_SESSION: SessionSnapshot = { data: null, isPending: true }
const GUEST_SESSION: SessionSnapshot = { data: null, isPending: false }
const SIGNED_IN_SESSION: SessionSnapshot = { data: { user: { id: 'user-1' } }, isPending: false }

const BOARD_MENU_HREFS = ['/boards', '/boards/free', '/boards/qna', '/boards/review']

let sessionSnapshot: SessionSnapshot = PENDING_SESSION
let pathnameSnapshot = '/'

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('next/navigation', () => ({ usePathname: () => pathnameSnapshot }))
mock.module('@/shared/lib/auth-client', () => ({ useSession: () => sessionSnapshot }))
mock.module('@/shared/ui/dropdown-menu', () => ({
    DropdownMenu: Passthrough,
    DropdownMenuTrigger: Passthrough,
    DropdownMenuContent: Passthrough,
    DropdownMenuItem: Passthrough,
    DropdownMenuSeparator: () => null,
}))

const { PublicHeaderActions } = await import('@/widgets/app-shell/public-header-actions')

const renderActions = (snapshot: SessionSnapshot, pathname = '/') => {
    sessionSnapshot = snapshot
    pathnameSnapshot = pathname
    return render(<PublicHeaderActions />)
}

const boardMenuHrefs = () =>
    screen
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
        .filter((href) => href !== null && href.startsWith('/boards'))

const currentLinkNames = () =>
    screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('aria-current') === 'page')
        .map((link) => link.textContent)

afterEach(cleanup)

describe('PublicHeaderActions', () => {
    test('세션을 기다리는 동안에도 탐색 셀과 게시판 메뉴 트리거를 그린다', () => {
        renderActions(PENDING_SESSION)
        const trigger = screen.getByRole('button', { name: '게시판' })

        expect(screen.getByRole('link', { name: '탐색' }).getAttribute('href')).toBe('/explore')
        expect(trigger.getAttribute('data-variant')).toBe('cell')
        expect(trigger.getAttribute('data-size')).toBe('cell')
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
        expect(screen.getByRole('button', { name: '게시판' })).toBeDefined()
        expect(screen.getByRole('link', { name: '로그인' }).getAttribute('href')).toBe('/login')
        expect(screen.getByRole('link', { name: '시작하기' }).getAttribute('href')).toBe('/signup')
    })

    test('로그인 상태면 로그인 대신 홈으로 바꾼다', () => {
        renderActions(SIGNED_IN_SESSION)

        expect(screen.getByRole('link', { name: '탐색' })).toBeDefined()
        expect(screen.getByRole('button', { name: '게시판' })).toBeDefined()
        expect(screen.getByRole('link', { name: '홈' }).getAttribute('href')).toBe('/')
        expect(screen.queryByRole('link', { name: '로그인' })).toBeNull()
        expect(screen.queryByRole('link', { name: '시작하기' })).toBeNull()
    })

    test('게시판 메뉴는 전체와 기본 게시판 3개를 링크로 담는다', () => {
        renderActions(GUEST_SESSION)

        expect(boardMenuHrefs()).toEqual(BOARD_MENU_HREFS)
        expect(screen.getByRole('link', { name: '게시판 전체' }).getAttribute('href')).toBe('/boards')
        expect(screen.getByRole('link', { name: '자유게시판' }).getAttribute('href')).toBe('/boards/free')
        expect(screen.getByRole('link', { name: '질문게시판' }).getAttribute('href')).toBe('/boards/qna')
        expect(screen.getByRole('link', { name: '여행 후기' }).getAttribute('href')).toBe('/boards/review')
    })

    test('게시판 목록 경로에서는 전체 항목만 현재 페이지로 표시한다', () => {
        renderActions(GUEST_SESSION, '/boards')

        expect(currentLinkNames()).toEqual(['게시판 전체'])
    })

    test('게시판 상세 경로에서는 그 게시판 항목만 현재 페이지로 표시한다', () => {
        renderActions(GUEST_SESSION, '/boards/free/post-1')

        expect(currentLinkNames()).toEqual(['자유게시판'])
    })

    test('게시판과 무관한 경로에서는 현재 페이지 표시가 없다', () => {
        renderActions(GUEST_SESSION, '/explore')

        expect(currentLinkNames()).toEqual([])
    })
})
