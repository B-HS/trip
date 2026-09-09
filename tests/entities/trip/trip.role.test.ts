import { describe, expect, test } from 'bun:test'
import { canAccess, canEdit, canManage, canView, resolveTripRole } from '@/entities/trip/trip.role'

const OWNER_ID = 'owner-1'
const OTHER_ID = 'user-2'

describe('resolveTripRole', () => {
    test('소유자면 멤버 행이 없어도 owner 로 판정한다', () => {
        expect(resolveTripRole({ ownerId: OWNER_ID, memberRole: null }, OWNER_ID)).toBe('owner')
    })

    test('소유자면 멤버 행의 역할보다 owner 가 우선한다', () => {
        expect(resolveTripRole({ ownerId: OWNER_ID, memberRole: 'viewer' }, OWNER_ID)).toBe('owner')
    })

    test('소유자가 아니면 멤버 역할을 그대로 반환한다', () => {
        expect(resolveTripRole({ ownerId: OWNER_ID, memberRole: 'editor' }, OTHER_ID)).toBe('editor')
    })

    test('소유자도 멤버도 아니면 null 을 반환한다', () => {
        expect(resolveTripRole({ ownerId: OWNER_ID, memberRole: null }, OTHER_ID)).toBeNull()
    })
})

describe('권한 판정', () => {
    test('canView 는 멤버 역할이 있으면 참이다', () => {
        expect(canView('owner')).toBe(true)
        expect(canView('editor')).toBe(true)
        expect(canView('viewer')).toBe(true)
        expect(canView(null)).toBe(false)
    })

    test('canEdit 은 owner 와 editor 만 참이다', () => {
        expect(canEdit('owner')).toBe(true)
        expect(canEdit('editor')).toBe(true)
        expect(canEdit('viewer')).toBe(false)
        expect(canEdit(null)).toBe(false)
    })

    test('canManage 는 owner 만 참이다', () => {
        expect(canManage('owner')).toBe(true)
        expect(canManage('editor')).toBe(false)
        expect(canManage('viewer')).toBe(false)
        expect(canManage(null)).toBe(false)
    })
})

describe('canAccess 레벨 매트릭스', () => {
    test('view 레벨은 모든 멤버가 통과한다', () => {
        expect(canAccess('owner', 'view')).toBe(true)
        expect(canAccess('editor', 'view')).toBe(true)
        expect(canAccess('viewer', 'view')).toBe(true)
        expect(canAccess(null, 'view')).toBe(false)
    })

    test('edit 레벨은 viewer 를 막는다', () => {
        expect(canAccess('owner', 'edit')).toBe(true)
        expect(canAccess('editor', 'edit')).toBe(true)
        expect(canAccess('viewer', 'edit')).toBe(false)
    })

    test('own 레벨은 owner 만 통과한다', () => {
        expect(canAccess('owner', 'own')).toBe(true)
        expect(canAccess('editor', 'own')).toBe(false)
        expect(canAccess('viewer', 'own')).toBe(false)
    })
})
