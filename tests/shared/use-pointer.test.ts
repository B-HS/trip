import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, renderHook } from '@testing-library/react'
import { FINE_POINTER_MEDIA_QUERY, useFinePointer } from '@/shared/hooks/use-pointer'

afterEach(cleanup)

describe('useFinePointer', () => {
    test('포인터 정밀도 미디어 쿼리를 읽는다', () => {
        expect(FINE_POINTER_MEDIA_QUERY).toBe('(pointer: fine)')

        const { result, unmount } = renderHook(() => useFinePointer())
        expect(result.current).toBe(window.matchMedia(FINE_POINTER_MEDIA_QUERY).matches)
        expect(() => unmount()).not.toThrow()
    })
})
