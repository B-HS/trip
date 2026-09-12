import { describe, expect, test } from 'bun:test'
import en from '@/messages/en.json'
import ja from '@/messages/ja.json'
import ko from '@/messages/ko.json'

const HANGUL_PATTERN = /[가-힣]/
const INTENTIONAL_HANGUL_KEYS = new Set(['common.localeSwitcher.names.ko'])

const flattenMessages = (value: unknown, path: string[] = [], result = new Map<string, string>()) => {
    if (typeof value === 'string') {
        result.set(path.join('.'), value)
        return result
    }
    if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([key, child]) => flattenMessages(child, [...path, key], result))
    }
    return result
}

const catalogs = { en: flattenMessages(en), ja: flattenMessages(ja), ko: flattenMessages(ko) }

describe('i18n message catalogs', () => {
    test('ko·en·ja 카탈로그의 재귀 키가 모두 같다', () => {
        const koKeys = [...catalogs.ko.keys()].sort()
        expect([...catalogs.en.keys()].sort()).toEqual(koKeys)
        expect([...catalogs.ja.keys()].sort()).toEqual(koKeys)
    })

    test('영어와 일본어 번역에 의도하지 않은 한글이 섞이지 않는다', () => {
        for (const catalog of [catalogs.en, catalogs.ja]) {
            const mixedKeys = [...catalog]
                .filter(([key, value]) => !INTENTIONAL_HANGUL_KEYS.has(key) && HANGUL_PATTERN.test(value))
                .map(([key]) => key)
            expect(mixedKeys).toEqual([])
        }
    })
})
