import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { BoardCells } = await import('@/features/community/board-cells')

const BOARD_CELLS = [
    { name: '자유게시판', href: '/boards/free' },
    { name: '질문게시판', href: '/boards/qna' },
    { name: '여행 후기', href: '/boards/review' },
]

afterEach(cleanup)

describe('BoardCells', () => {
    test('게시판마다 진입 셀을 하나씩 그린다', () => {
        render(<BoardCells />)

        expect(screen.getAllByRole('link').length).toBe(BOARD_CELLS.length)
        BOARD_CELLS.forEach(({ name, href }) => expect(screen.getByRole('link', { name }).getAttribute('href')).toBe(href))
    })

    test('셀 행은 심을 만드는 부모로 감싼다', () => {
        const { container } = render(<BoardCells />)
        const row = container.querySelector('nav')

        expect(row?.className).toContain('gap-px')
        expect(row?.className).toContain('bg-background')
    })

    test('심 색을 바꿔 공개 표면에서도 쓸 수 있다', () => {
        const { container } = render(<BoardCells className='bg-border' />)

        expect(container.querySelector('nav')?.className).toContain('bg-border')
    })
})
