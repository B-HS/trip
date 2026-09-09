import { describe, expect, test } from 'bun:test'
import { isNavItemActive, type NavActiveTarget } from '@/features/app-shell/nav-active'

const HOME: NavActiveTarget = { href: '/' }
const EXPLORE: NavActiveTarget = { href: '/explore', matchPrefix: true }
const BOARDS: NavActiveTarget = { href: '/boards', matchPrefix: true }
const TRIPS: NavActiveTarget = { href: '/trips' }
const NEW_TRIP: NavActiveTarget = { href: '/trips/new' }

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
