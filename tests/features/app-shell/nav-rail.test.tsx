import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { HomeIcon, MessagesSquareIcon } from 'lucide-react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { NavItemLink } from '@/features/app-shell/nav-item'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

const MotionSpan = ({ className, layoutId }: { className?: string; layoutId?: string }) => <span className={className} data-layout-id={layoutId} />

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('motion/react', () => ({ motion: { span: MotionSpan } }))

const { NavRail } = await import('@/features/app-shell/nav-rail')
const { NAV_ACTIVE_LAYOUT_ID } = await import('@/features/app-shell/nav-item')

type BoardNavHref = '/boards/free' | '/boards/qna' | '/boards/review'

const NAV_ITEMS: NavItemLink<BoardNavHref>[] = [
    { href: '/', label: '홈', icon: HomeIcon },
    {
        href: '/boards',
        label: '게시판',
        icon: MessagesSquareIcon,
        matchPrefix: true,
        children: [
            { href: '/boards/free', label: '자유', matchPrefix: true },
            { href: '/boards/qna', label: '질문', matchPrefix: true },
            { href: '/boards/review', label: '후기', matchPrefix: true },
        ],
    },
]

const USER = { name: '지수', email: 'jisu@example.com', username: 'jisu', image: null }

const ACTIVE_MARKER_PATHS = ['/', '/boards', '/boards/qna', '/boards/qna/6f1c0f2a', '/boards/news']

const renderRail = (activePath: string, isCollapsed: boolean) =>
    render(<NavRail items={NAV_ITEMS} favorites={[]} activePath={activePath} isCollapsed={isCollapsed} user={USER} onSignOut={() => {}} />)

afterEach(cleanup)

describe('NavRail', () => {
    test('펼친 상태에서 게시판 하위 목록을 tree 로 보여준다', () => {
        renderRail('/boards', false)

        expect(screen.getByRole('link', { name: '자유' }).getAttribute('href')).toBe('/boards/free')
        expect(screen.getByRole('link', { name: '질문' }).getAttribute('href')).toBe('/boards/qna')
        expect(screen.getByRole('link', { name: '후기' }).getAttribute('href')).toBe('/boards/review')
    })

    test('접힌 상태에서는 하위 게시판을 감춘다', () => {
        renderRail('/boards', true)

        expect(screen.queryByRole('link', { name: '자유' })).toBeNull()
        expect(screen.queryByRole('link', { name: '질문' })).toBeNull()
        expect(screen.queryByRole('link', { name: '후기' })).toBeNull()
    })

    test('하위 게시판을 보고 있으면 부모가 아니라 그 하위만 활성으로 표시한다', () => {
        renderRail('/boards/qna', false)

        expect(screen.getByRole('link', { name: '질문' }).getAttribute('aria-current')).toBe('page')
        expect(screen.getByRole('link', { name: '자유' }).getAttribute('aria-current')).toBeNull()
        expect(screen.getByRole('link', { name: '게시판' }).getAttribute('aria-current')).toBeNull()
    })

    test('게시판 목록 경로에서는 부모 항목이 활성이다', () => {
        renderRail('/boards', false)

        expect(screen.getByRole('link', { name: '게시판' }).getAttribute('aria-current')).toBe('page')
        expect(screen.getByRole('link', { name: '질문' }).getAttribute('aria-current')).toBeNull()
    })

    test('목록에 없는 게시판 경로에서는 부모가 활성으로 남는다', () => {
        renderRail('/boards/news', false)

        expect(screen.getByRole('link', { name: '게시판' }).getAttribute('aria-current')).toBe('page')
    })

    test('어느 경로에서도 활성 표시는 하나만 렌더된다', () => {
        for (const path of ACTIVE_MARKER_PATHS) {
            const { container } = renderRail(path, false)

            expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
            expect(container.querySelectorAll(`[data-layout-id="${NAV_ACTIVE_LAYOUT_ID}"]`)).toHaveLength(1)
        }
    })

    test('하위 목록은 부모 항목의 li 안에 중첩된다', () => {
        renderRail('/boards', false)

        const parentItem = screen.getByRole('link', { name: '게시판' }).closest('li')

        expect(parentItem?.querySelectorAll('ul a')).toHaveLength(3)
    })
})
