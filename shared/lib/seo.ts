import { routing, type AppLocale } from '@/i18n/routing'
import { SITE_URL } from '@/shared/constant/site'

const localePrefix = (locale: string) => (locale === routing.defaultLocale ? '' : `/${locale}`)

/** Return a URL path using next-intl's as-needed locale prefix strategy. */
export const localizedPath = (path: string, locale: string) => {
    const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
    return `${localePrefix(locale)}${normalized || '/'}`
}

/** Build canonical and hreflang links for a logical (locale-independent) route. */
export const localizedAlternates = (path: string, locale: string = routing.defaultLocale) => ({
    canonical: localizedPath(path, locale),
    languages: {
        'x-default': `${SITE_URL}${localizedPath(path, routing.defaultLocale)}`,
        'ko': `${SITE_URL}${localizedPath(path, 'ko')}`,
        'en': `${SITE_URL}${localizedPath(path, 'en')}`,
        'ja': `${SITE_URL}${localizedPath(path, 'ja')}`,
    },
})

export const localizedUrl = (path: string, locale: AppLocale | string = routing.defaultLocale) => `${SITE_URL}${localizedPath(path, locale)}`

export const noIndexRobots = { index: false, follow: false } as const

export const toAbsoluteSiteUrl = (value: string) => {
    try {
        return new URL(value, SITE_URL).toString()
    } catch {
        return SITE_URL
    }
}
