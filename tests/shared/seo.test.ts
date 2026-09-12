import { describe, expect, test } from 'bun:test'
import { localizedAlternates, localizedPath } from '@/shared/lib/seo'

describe('localized SEO URLs', () => {
    test('keeps Korean unprefixed and prefixes English and Japanese routes', () => {
        expect(localizedPath('/', 'ko')).toBe('/')
        expect(localizedPath('/s/osaka', 'en')).toBe('/en/s/osaka')
        expect(localizedPath('/s/osaka', 'ja')).toBe('/ja/s/osaka')
    })

    test('uses the current locale for canonical while exposing all alternates', () => {
        const alternates = localizedAlternates('/explore', 'ja')

        expect(alternates.canonical).toBe('/ja/explore')
        expect(alternates.languages).toMatchObject({ ko: 'https://trip.gumyo.net/explore', en: 'https://trip.gumyo.net/en/explore' })
    })
})
