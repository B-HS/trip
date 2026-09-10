import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { MOCK_BOARD } from '@/tests/support/community-repository-mock'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { BoardsIndex } = await import('@/widgets/community/boards-index')

const renderIndex = async () => render(await BoardsIndex())

afterEach(cleanup)

describe('BoardsIndex', () => {
    test('게시판별 헤더 스트립을 muted 계층으로 그린다', async () => {
        await renderIndex()

        expect(screen.getByRole('heading', { name: MOCK_BOARD.name }).parentElement?.className).toContain('bg-muted')
    })

    test('페이지 대문도 muted 스트립으로 올린다', async () => {
        await renderIndex()

        expect(screen.getByRole('heading', { name: '게시판' }).parentElement?.className).toContain('bg-muted')
    })

    test('게시판 열기 셀은 muted 스트립 위에서 카드 톤으로 남는다', async () => {
        await renderIndex()

        const cell = screen.getByRole('link', { name: '게시판 열기' })

        expect(cell.getAttribute('href')).toBe(`/boards/${MOCK_BOARD.key}`)
        expect(cell.className).toContain('bg-card')
    })
})
