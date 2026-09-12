import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { PublicFrame } = await import('@/features/app-shell/public-frame')

afterEach(cleanup)

describe('PublicFrame', () => {
    test('머리말 액션 슬롯을 그대로 그린다', () => {
        render(
            <PublicFrame actions={<span>액션 슬롯</span>} year='2026'>
                <p>본문</p>
            </PublicFrame>,
        )

        expect(screen.getByRole('banner').textContent).toContain('액션 슬롯')
    })

    test('자식을 본문 영역에 넣는다', () => {
        render(
            <PublicFrame actions={null} year='2026'>
                <p>본문</p>
            </PublicFrame>,
        )

        expect(screen.getByRole('main').textContent).toBe('본문')
    })

    test('바닥글에 전달받은 연도를 표시한다', () => {
        render(
            <PublicFrame actions={null} year='2026'>
                <p>본문</p>
            </PublicFrame>,
        )

        expect(screen.getByRole('contentinfo').textContent).toContain('© 2026')
    })

    test('바닥글에 개발자 API 공개 진입점을 표시한다', () => {
        render(
            <PublicFrame actions={null} year='2026'>
                <p>본문</p>
            </PublicFrame>,
        )

        expect(screen.getByRole('link', { name: '개발자 API' }).getAttribute('href')).toBe('/developers')
    })

    test('공개 표면 클래스를 최상위에 유지한다', () => {
        const { container } = render(
            <PublicFrame actions={null} year='2026'>
                <p>본문</p>
            </PublicFrame>,
        )

        expect(container.firstElementChild?.className).toContain('surface-public')
    })
})
