import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { SearchForm } from '@/features/community/search-form'

const BOARD_PATH = '/boards/free'

afterEach(cleanup)

describe('SearchForm', () => {
    test('GET 폼으로 지정한 주소에 검색어를 보낸다', () => {
        const { container } = render(<SearchForm action={BOARD_PATH} defaultQuery='' />)
        const form = container.querySelector('form')

        expect(form?.getAttribute('action')).toBe('/boards/free')
        expect(form?.getAttribute('method')).toBe('get')
        expect(screen.getByRole('searchbox', { name: '검색어' }).getAttribute('name')).toBe('q')
    })

    test('기존 검색어를 기본값으로 채운다', () => {
        render(<SearchForm action={BOARD_PATH} defaultQuery='환승' />)

        expect(screen.getByRole('searchbox', { name: '검색어' }).getAttribute('value')).toBe('환승')
    })

    test('기본 안내 문구를 쓰고 필요하면 바꿀 수 있다', () => {
        const { rerender } = render(<SearchForm action={BOARD_PATH} defaultQuery='' />)
        expect(screen.getByPlaceholderText('제목으로 검색')).toBeDefined()

        rerender(<SearchForm action={BOARD_PATH} defaultQuery='' placeholder='트립 제목으로 검색' />)
        expect(screen.getByPlaceholderText('트립 제목으로 검색')).toBeDefined()
    })

    test('제출 버튼을 보여준다', () => {
        render(<SearchForm action={BOARD_PATH} defaultQuery='' />)

        expect(screen.getByRole('button', { name: '검색' }).getAttribute('type')).toBe('submit')
    })
})
