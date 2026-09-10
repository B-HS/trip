import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { BOARD_CELL_LINKS } from '@/tests/support/community-repository-mock'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

const MotionDiv = ({ children, className }: PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>

mock.module('next/link', () => ({ default: LinkStub }))
mock.module('motion/react', () => ({ motion: { div: MotionDiv } }))

const { IntroCommunitySections } = await import('@/widgets/intro/intro-community-sections')

const renderSections = async () => render(await IntroCommunitySections())

afterEach(cleanup)

describe('IntroCommunitySections', () => {
    test('최신 글 섹션에 게시판 진입 셀 3개를 둔다', async () => {
        await renderSections()

        BOARD_CELL_LINKS.forEach(({ name, href }) => expect(screen.getByRole('link', { name }).getAttribute('href')).toBe(href))
    })

    test('섹션 헤더는 muted 스트립으로 올린다', async () => {
        await renderSections()

        expect(screen.getByRole('heading', { name: '커뮤니티 최신 글' }).parentElement?.className).toContain('bg-muted')
    })

    test('공개 표면에서는 심을 border 로 그린다', async () => {
        const { container } = await renderSections()

        expect(container.querySelector('nav')?.className).toContain('bg-border')
    })
})
