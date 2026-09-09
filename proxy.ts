import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_PREFIX } from '@/shared/constant/auth'
import { HOME_PATH, LOGIN_PATH, SIGNUP_PATH } from '@/shared/constant/route'

const PROTECTED_PATTERNS = [/^\/trips(?:\/.*)?$/, /^\/settings(?:\/.*)?$/, /^\/boards\/[^/]+\/new$/, /^\/boards\/[^/]+\/[^/]+\/edit$/]
const GUEST_ONLY_PATHS: string[] = [LOGIN_PATH, SIGNUP_PATH]

export const proxy = (request: NextRequest) => {
    const { pathname } = request.nextUrl
    const sessionCookie = getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX })

    if (!sessionCookie && PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))) {
        const loginUrl = new URL(LOGIN_PATH, request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (GUEST_ONLY_PATHS.includes(pathname) && sessionCookie) {
        return NextResponse.redirect(new URL(HOME_PATH, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/trips/:path*', '/settings/:path*', '/boards/:key/new', '/boards/:key/:postId/edit', '/login', '/signup'],
}
