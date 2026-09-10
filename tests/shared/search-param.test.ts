import { beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { replaceSearchParam } from '@/shared/lib/search-param'

const BASE_PATH = '/trips'

const setLocation = (path: string) => window.history.replaceState(null, '', path)

beforeEach(() => setLocation(BASE_PATH))

describe('replaceSearchParam', () => {
    test('값을 주면 쿼리에 넣는다', () => {
        replaceSearchParam('route', 'ICN-KIX')
        expect(window.location.pathname).toBe(BASE_PATH)
        expect(window.location.search).toBe('?route=ICN-KIX')
    })

    test('같은 키는 덮어쓰고 다른 키는 남긴다', () => {
        setLocation(`${BASE_PATH}?view=day&route=ICN-KIX`)
        replaceSearchParam('route', 'ICN-FUK')
        expect(window.location.search).toBe('?view=day&route=ICN-FUK')
    })

    test('null 이면 그 키만 지운다', () => {
        setLocation(`${BASE_PATH}?view=day&route=ICN-KIX`)
        replaceSearchParam('route', null)
        expect(window.location.search).toBe('?view=day')
    })

    test('남는 쿼리가 없으면 물음표 없이 경로만 남긴다', () => {
        setLocation(`${BASE_PATH}?route=ICN-KIX`)
        replaceSearchParam('route', null)
        expect(window.location.pathname).toBe(BASE_PATH)
        expect(window.location.search).toBe('')
    })

    test('결과가 같으면 history 를 다시 쓰지 않는다', () => {
        setLocation(`${BASE_PATH}?route=ICN-KIX`)
        const replaceState = spyOn(window.history, 'replaceState')

        replaceSearchParam('route', 'ICN-KIX')
        expect(replaceState).not.toHaveBeenCalled()

        replaceSearchParam('route', 'ICN-FUK')
        expect(replaceState).toHaveBeenCalledTimes(1)
        replaceState.mockRestore()
    })
})
