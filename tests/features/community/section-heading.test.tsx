import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { SectionHeading } = await import('@/features/community/section-heading')

const EXPLORE_PATH = '/explore'

afterEach(cleanup)

describe('SectionHeading', () => {
    test('제목을 제목 요소로 보여준다', () => {
        render(<SectionHeading title='최근 공개 트립' />)

        expect(screen.getByRole('heading', { name: '최근 공개 트립' })).toBeDefined()
    })

    test('설명은 있을 때만 보여준다', () => {
        const { rerender } = render(<SectionHeading title='최근 공개 트립' />)
        expect(screen.queryByText('다른 사람이 공개한 일정입니다.')).toBeNull()

        rerender(<SectionHeading title='최근 공개 트립' description='다른 사람이 공개한 일정입니다.' />)
        expect(screen.getByText('다른 사람이 공개한 일정입니다.')).toBeDefined()
    })

    test('더 보기 주소가 있으면 링크 셀을 붙인다', () => {
        render(<SectionHeading title='최근 공개 트립' moreHref={EXPLORE_PATH} />)

        expect(screen.getByRole('link', { name: '더 보기' }).getAttribute('href')).toBe('/explore')
    })

    test('더 보기 문구를 바꿀 수 있다', () => {
        render(<SectionHeading title='최근 공개 트립' moreHref={EXPLORE_PATH} moreLabel='탐색으로' />)

        expect(screen.getByRole('link', { name: '탐색으로' })).toBeDefined()
    })

    test('더 보기 주소가 없으면 링크가 없다', () => {
        render(<SectionHeading title='최근 공개 트립' />)

        expect(screen.queryByRole('link')).toBeNull()
    })

    test('제목 스트립은 muted 계층으로 올려 섹션 경계를 만든다', () => {
        const { container } = render(<SectionHeading title='최근 공개 트립' />)
        const strip = container.querySelector('h2')?.parentElement

        expect(strip?.className).toContain('bg-muted')
        expect(strip?.className).not.toContain('bg-card')
    })

    test('더 보기 셀은 muted 스트립 위에서 카드 톤으로 남는다', () => {
        render(<SectionHeading title='최근 공개 트립' moreHref={EXPLORE_PATH} />)

        expect(screen.getByRole('link', { name: '더 보기' }).className).toContain('bg-card')
    })
})
