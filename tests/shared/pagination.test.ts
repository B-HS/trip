import { describe, expect, test } from 'bun:test'
import { buildPage } from '@/shared/lib/pagination'

const PAGE_SIZE = 20

describe('buildPage', () => {
    test('첫 페이지의 오프셋은 0 이다', () => {
        expect(buildPage(45, 1, PAGE_SIZE)).toEqual({ page: 1, pageSize: PAGE_SIZE, total: 45, pageCount: 3, offset: 0 })
    })

    test('페이지가 올라가면 오프셋도 함께 커진다', () => {
        expect(buildPage(45, 3, PAGE_SIZE).offset).toBe(40)
    })

    test('마지막 페이지를 넘으면 마지막 페이지로 줄인다', () => {
        expect(buildPage(45, 9, PAGE_SIZE)).toMatchObject({ page: 3, offset: 40 })
    })

    test('0 이하 페이지는 첫 페이지로 올린다', () => {
        expect(buildPage(45, 0, PAGE_SIZE).page).toBe(1)
        expect(buildPage(45, -5, PAGE_SIZE).page).toBe(1)
    })

    test('숫자가 아니면 첫 페이지로 되돌린다', () => {
        expect(buildPage(45, Number.NaN, PAGE_SIZE).page).toBe(1)
    })

    test('결과가 없어도 페이지 수는 1 이다', () => {
        expect(buildPage(0, 1, PAGE_SIZE)).toEqual({ page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 1, offset: 0 })
    })

    test('정확히 나누어떨어지면 페이지 수가 늘지 않는다', () => {
        expect(buildPage(40, 1, PAGE_SIZE).pageCount).toBe(2)
    })
})
