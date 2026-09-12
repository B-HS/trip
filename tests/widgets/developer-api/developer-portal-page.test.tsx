import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'

const { default: DevelopersPage } = await import('@/app/[locale]/(public)/developers/page')

describe('DevelopersPage', () => {
    test('개발자 포털에서 토큰 관리 진입점을 제공한다', async () => {
        render(await DevelopersPage())

        expect(screen.getByRole('link', { name: 'API 토큰 관리' }).getAttribute('href')).toBe('/settings/api')
    })
})
