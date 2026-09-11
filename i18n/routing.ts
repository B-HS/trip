import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
    locales: ['ko', 'ja', 'en'],
    defaultLocale: 'ko',
    localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]

export const openGraphLocale = (locale: string) => (locale === 'ja' ? 'ja_JP' : locale === 'en' ? 'en_US' : 'ko_KR')
