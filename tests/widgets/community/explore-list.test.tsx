import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import '@/tests/support/community-repository-mock'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { ExploreList } = await import('@/widgets/community/explore-list')

const FIRST_PAGE = 1

const renderList = async () => render(await ExploreList({ sort: 'recent', page: FIRST_PAGE }))

afterEach(cleanup)

describe('ExploreList', () => {
    test('페이지 헤더를 muted 스트립으로 올린다', async () => {
        await renderList()

        expect(screen.getByRole('heading', { name: '탐색' }).parentElement?.className).toContain('bg-muted')
    })

    test('정렬 스트립은 기존 background 심을 유지한다', async () => {
        const { container } = await renderList()

        expect(container.querySelector('nav')?.className).toContain('bg-background')
    })
})
