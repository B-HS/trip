import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { RailFavorites } = await import('@/features/app-shell/rail-favorites')
const { TooltipProvider } = await import('@/shared/ui/tooltip')

const FAVORITES = [
    { id: 'trip-1', title: '오사카 여행 노트', code: 'JP' },
    { id: 'trip-2', title: '타이베이 3일', code: null },
]

afterEach(cleanup)

describe('RailFavorites', () => {
    test('즐겨찾기가 없으면 안내 문구를 보여준다', () => {
        render(<RailFavorites favorites={[]} activePath='/trips' isCollapsed={false} />)

        expect(screen.getByText('목록에서 별표를 눌러 추가하세요')).toBeDefined()
    })

    test('접힌 상태에서 즐겨찾기가 없으면 아무것도 그리지 않는다', () => {
        const { container } = render(<RailFavorites favorites={[]} activePath='/trips' isCollapsed />)

        expect(container.textContent).toBe('')
    })

    test('나라 코드와 함께 상세 경로로 연결한다', () => {
        render(<RailFavorites favorites={FAVORITES} activePath='/trips' isCollapsed={false} />)

        expect(screen.getByText('JP')).toBeDefined()
        expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/trips/trip-1', '/trips/trip-2'])
    })

    test('보고 있는 트립의 하위 경로까지 활성으로 표시한다', () => {
        render(<RailFavorites favorites={FAVORITES} activePath='/trips/trip-2/edit' isCollapsed={false} />)
        const links = screen.getAllByRole('link')

        expect(links[0]?.getAttribute('aria-current')).toBeNull()
        expect(links[1]?.getAttribute('aria-current')).toBe('page')
    })

    test('접힌 상태에서는 제목을 접근성 라벨로만 남긴다', () => {
        render(
            <TooltipProvider>
                <RailFavorites favorites={FAVORITES} activePath='/trips' isCollapsed />
            </TooltipProvider>,
        )

        expect(screen.getByRole('link', { name: '오사카 여행 노트' })).toBeDefined()
        expect(screen.queryByText('오사카 여행 노트')).toBeNull()
    })
})
