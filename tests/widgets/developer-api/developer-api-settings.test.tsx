import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'

const { DeveloperApiSettings } = await import('@/widgets/developer-api/developer-api-settings')

afterEach(cleanup)

describe('DeveloperApiSettings', () => {
    test('토큰 설정 화면에서 API 문서 링크를 제공한다', () => {
        render(<DeveloperApiSettings initialTokens={[]} />)

        expect(screen.getByRole('link', { name: 'API 문서 보기' }).getAttribute('href')).toBe('/developers')
    })
})
