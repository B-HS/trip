import { describe, expect, test } from 'bun:test'
import { isAdminRole } from '@/entities/auth/auth.role'
import { ADMIN_ROLE, DEFAULT_USER_ROLE } from '@/shared/constant/auth'

describe('isAdminRole', () => {
    test('admin 역할이면 true 를 반환한다', () => {
        expect(isAdminRole(ADMIN_ROLE)).toBe(true)
    })

    test('일반 사용자 역할이면 false 를 반환한다', () => {
        expect(isAdminRole(DEFAULT_USER_ROLE)).toBe(false)
    })

    test('역할이 없으면 false 를 반환한다', () => {
        expect(isAdminRole(null)).toBe(false)
        expect(isAdminRole(undefined)).toBe(false)
    })

    test('모르는 역할이면 false 를 반환한다', () => {
        expect(isAdminRole('superuser')).toBe(false)
    })
})
