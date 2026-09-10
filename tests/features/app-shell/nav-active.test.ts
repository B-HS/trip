import { describe, expect, test } from 'bun:test'
import { hasNavChildren, isNavItemActive, isNavParentActive, type NavActiveParent, type NavActiveTarget } from '@/features/app-shell/nav-active'

const HOME: NavActiveTarget = { href: '/' }
const EXPLORE: NavActiveTarget = { href: '/explore', matchPrefix: true }
const BOARDS: NavActiveTarget = { href: '/boards', matchPrefix: true }
const TRIPS: NavActiveTarget = { href: '/trips' }
const NEW_TRIP: NavActiveTarget = { href: '/trips/new' }

const BOARDS_TREE: NavActiveParent<'/boards/free' | '/boards/qna'> = {
    href: '/boards',
    matchPrefix: true,
    children: [
        { href: '/boards/free', label: '자유', matchPrefix: true },
        { href: '/boards/qna', label: '질문', matchPrefix: true },
    ],
}

const EMPTY_TREE: NavActiveParent = { href: '/boards', matchPrefix: true, children: [] }

describe('isNavItemActive', () => {
    test('홈은 경로가 정확히 같을 때만 활성이다', () => {
        expect(isNavItemActive('/', HOME)).toBe(true)
        expect(isNavItemActive('/explore', HOME)).toBe(false)
        expect(isNavItemActive('/trips', HOME)).toBe(false)
    })

    test('접두사 항목은 하위 경로까지 활성이다', () => {
        expect(isNavItemActive('/boards', BOARDS)).toBe(true)
        expect(isNavItemActive('/boards/free', BOARDS)).toBe(true)
        expect(isNavItemActive('/boards/free/6f1c0f2a', BOARDS)).toBe(true)
        expect(isNavItemActive('/explore', EXPLORE)).toBe(true)
    })

    test('접두사 항목이라도 다른 경로가 이어 붙으면 활성이 아니다', () => {
        expect(isNavItemActive('/boardsx', BOARDS)).toBe(false)
        expect(isNavItemActive('/explored', EXPLORE)).toBe(false)
        expect(isNavItemActive('/', BOARDS)).toBe(false)
    })

    test('접두사가 아닌 항목은 하위 경로에서 활성이 아니다', () => {
        expect(isNavItemActive('/trips', TRIPS)).toBe(true)
        expect(isNavItemActive('/trips/new', TRIPS)).toBe(false)
        expect(isNavItemActive('/trips/6f1c0f2a', TRIPS)).toBe(false)
        expect(isNavItemActive('/trips/new', NEW_TRIP)).toBe(true)
    })
})

describe('isNavParentActive', () => {
    test('펼친 상태에서 하위가 있는 항목은 경로가 정확히 같을 때만 활성이다', () => {
        expect(isNavParentActive('/boards', BOARDS_TREE, false)).toBe(true)
        expect(isNavParentActive('/boards/free', BOARDS_TREE, false)).toBe(false)
        expect(isNavParentActive('/boards/qna/6f1c0f2a', BOARDS_TREE, false)).toBe(false)
    })

    test('접힌 상태에서 하위가 있는 항목은 하위 경로까지 활성이다', () => {
        expect(isNavParentActive('/boards', BOARDS_TREE, true)).toBe(true)
        expect(isNavParentActive('/boards/free', BOARDS_TREE, true)).toBe(true)
        expect(isNavParentActive('/boards/qna/6f1c0f2a', BOARDS_TREE, true)).toBe(true)
        expect(isNavParentActive('/trips', BOARDS_TREE, true)).toBe(false)
    })

    test('하위가 없는 항목은 기존 판정을 그대로 따른다', () => {
        expect(isNavParentActive('/', HOME, false)).toBe(isNavItemActive('/', HOME))
        expect(isNavParentActive('/explore/tag', EXPLORE, false)).toBe(isNavItemActive('/explore/tag', EXPLORE))
        expect(isNavParentActive('/trips/new', TRIPS, false)).toBe(isNavItemActive('/trips/new', TRIPS))
        expect(isNavParentActive('/boards/free', EMPTY_TREE, false)).toBe(true)
    })

    test('목록에 없는 하위 경로에서는 부모가 다시 활성이다', () => {
        expect(isNavParentActive('/boards/news', BOARDS_TREE, false)).toBe(true)
        expect(isNavParentActive('/boards/news/6f1c0f2a', BOARDS_TREE, false)).toBe(true)
    })
})

describe('hasNavChildren', () => {
    test('children 이 없거나 비어 있으면 하위가 없는 것으로 본다', () => {
        expect(hasNavChildren(BOARDS_TREE)).toBe(true)
        expect(hasNavChildren(EMPTY_TREE)).toBe(false)
        expect(hasNavChildren({ children: undefined })).toBe(false)
    })
})
