import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, cleanup, renderHook } from '@testing-library/react'
import {
    MOTION_PREFERENCE_STORAGE_KEY,
    setMotionPreference,
    useMotionPreference,
    useReducedMotionPreference,
} from '@/shared/hooks/use-motion-preference'

beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    cleanup()
    window.localStorage.clear()
})

describe('useMotionPreference', () => {
    test('저장된 값이 없으면 full 이다', () => {
        const { result } = renderHook(() => useMotionPreference())
        expect(result.current).toBe('full')
    })

    test('저장된 값이 유효하지 않으면 full 로 되돌린다', () => {
        window.localStorage.setItem(MOTION_PREFERENCE_STORAGE_KEY, 'slow')
        const { result } = renderHook(() => useMotionPreference())
        expect(result.current).toBe('full')
    })

    test('저장된 reduced 를 읽는다', () => {
        window.localStorage.setItem(MOTION_PREFERENCE_STORAGE_KEY, 'reduced')
        const { result } = renderHook(() => useMotionPreference())
        expect(result.current).toBe('reduced')
    })
})

describe('setMotionPreference', () => {
    test('localStorage 에 저장한다', () => {
        setMotionPreference('reduced')
        expect(window.localStorage.getItem(MOTION_PREFERENCE_STORAGE_KEY)).toBe('reduced')
        setMotionPreference('full')
        expect(window.localStorage.getItem(MOTION_PREFERENCE_STORAGE_KEY)).toBe('full')
    })

    test('구독 중인 훅에 변경을 알린다', () => {
        const { result } = renderHook(() => useMotionPreference())
        expect(result.current).toBe('full')

        act(() => setMotionPreference('reduced'))
        expect(result.current).toBe('reduced')

        act(() => setMotionPreference('full'))
        expect(result.current).toBe('full')
    })
})

describe('useReducedMotionPreference', () => {
    test('reduced 일 때만 true 다', () => {
        const { result } = renderHook(() => useReducedMotionPreference())
        expect(result.current).toBe(false)

        act(() => setMotionPreference('reduced'))
        expect(result.current).toBe(true)
    })
})
