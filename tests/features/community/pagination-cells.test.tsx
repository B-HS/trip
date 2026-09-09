import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { PaginationCells } = await import('@/features/community/pagination-cells')

const buildHref = (page: number) => `?page=${page}` as const

afterEach(cleanup)

describe('PaginationCells', () => {
    test('페이지가 하나뿐이면 아무것도 그리지 않는다', () => {
        const { container } = render(<PaginationCells page={1} pageCount={1} buildHref={buildHref} />)

        expect(container.firstChild).toBeNull()
    })

    test('현재 페이지와 전체 페이지 수를 보여준다', () => {
        render(<PaginationCells page={2} pageCount={5} buildHref={buildHref} />)

        expect(screen.getByText('2 / 5')).toBeDefined()
    })

    test('첫 페이지에서는 이전이 비활성이고 다음은 링크다', () => {
        render(<PaginationCells page={1} pageCount={3} buildHref={buildHref} />)

        expect(screen.getByRole('button', { name: '이전' }).hasAttribute('disabled')).toBe(true)
        expect(screen.getByRole('link', { name: '다음' }).getAttribute('href')).toBe('?page=2')
    })

    test('마지막 페이지에서는 다음이 비활성이고 이전은 링크다', () => {
        render(<PaginationCells page={3} pageCount={3} buildHref={buildHref} />)

        expect(screen.getByRole('button', { name: '다음' }).hasAttribute('disabled')).toBe(true)
        expect(screen.getByRole('link', { name: '이전' }).getAttribute('href')).toBe('?page=2')
    })
})
