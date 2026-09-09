import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_PREFIX } from '@/shared/constant/auth'

const PROTECTED_PREFIX = '/trips'
const GUEST_ONLY_PATHS = ['/', '/login', '/signup']

export const proxy = (request: NextRequest) => {
    const { pathname } = request.nextUrl
    const sessionCookie = getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX })

    if (pathname.startsWith(PROTECTED_PREFIX) && !sessionCookie) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (GUEST_ONLY_PATHS.includes(pathname) && sessionCookie) {
        return NextResponse.redirect(new URL(PROTECTED_PREFIX, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/trips/:path*', '/login', '/signup'],
}
