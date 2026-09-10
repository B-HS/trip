import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { BOARD_CELL_LINKS } from '@/tests/support/community-repository-mock'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { CommunityHome } = await import('@/widgets/community/community-home')

const renderHome = async () => render(await CommunityHome())

afterEach(cleanup)

describe('CommunityHome', () => {
    test('최신 글 섹션에 게시판 진입 셀 3개를 둔다', async () => {
        await renderHome()

        BOARD_CELL_LINKS.forEach(({ name, href }) => expect(screen.getByRole('link', { name }).getAttribute('href')).toBe(href))
    })

    test('섹션 헤더 스트립은 muted, 본문 블록은 card 로 둔다', async () => {
        const { container } = await renderHome()

        expect(screen.getByRole('heading', { name: '최신 글' }).parentElement?.className).toContain('bg-muted')
        expect(container.querySelector('article')?.className).toContain('bg-card')
    })

    test('페이지 대문도 muted 스트립으로 올린다', async () => {
        await renderHome()

        expect(screen.getByRole('heading', { name: '커뮤니티 홈' }).parentElement?.className).toContain('bg-muted')
    })
})
