import 'server-only'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { cache } from 'react'
import { redirect } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { LOGIN_PATH } from '@/shared/constant/route'
import { getAuth } from '@/shared/lib/auth'

export const getServerSession = cache(async () => getAuth().api.getSession({ headers: await headers() }))

export const requireUser = async () => {
    const session = await getServerSession()
    if (!session) {
        const locale = await getLocale().catch(() => routing.defaultLocale)
        redirect({ href: LOGIN_PATH, locale })
        throw new Error('UNAUTHORIZED')
    }
    return session.user
}
