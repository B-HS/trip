import { getSessionCookie } from 'better-auth/cookies'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing, type AppLocale } from '@/i18n/routing'
import { AUTH_COOKIE_PREFIX } from '@/shared/constant/auth'
import { HOME_PATH, LOGIN_PATH, SIGNUP_PATH } from '@/shared/constant/route'

const handleI18nRouting = createMiddleware(routing)

const PROTECTED_PATTERNS = [/^\/trips(?:\/.*)?$/, /^\/settings(?:\/.*)?$/, /^\/boards\/[^/]+\/new$/, /^\/boards\/[^/]+\/[^/]+\/edit$/]
const GUEST_ONLY_PATHS: string[] = [LOGIN_PATH, SIGNUP_PATH]

const localePrefixOf = (locale: AppLocale) => (locale === routing.defaultLocale ? '' : `/${locale}`)

const resolveLocale = (pathname: string): AppLocale => {
    const segment = pathname.split('/')[1]
    return routing.locales.find((locale) => locale !== routing.defaultLocale && locale === segment) ?? routing.defaultLocale
}

const stripLocalePrefix = (pathname: string, locale: AppLocale) => {
    const stripped = pathname.slice(localePrefixOf(locale).length)
    return stripped === '' ? HOME_PATH : stripped
}

export const proxy = (request: NextRequest) => {
    const i18nResponse = handleI18nRouting(request)
    if (i18nResponse.status !== 200) return i18nResponse

    const locale = resolveLocale(request.nextUrl.pathname)
    const prefix = localePrefixOf(locale)
    const pathname = stripLocalePrefix(request.nextUrl.pathname, locale)
    const sessionCookie = getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX })

    if (!sessionCookie && PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))) {
        const loginUrl = new URL(`${prefix}${LOGIN_PATH}`, request.url)
        loginUrl.searchParams.set('next', `${prefix}${pathname}`)
        return NextResponse.redirect(loginUrl)
    }

    if (GUEST_ONLY_PATHS.includes(pathname) && sessionCookie) {
        return NextResponse.redirect(new URL(prefix === '' ? HOME_PATH : prefix, request.url))
    }

    return i18nResponse
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
