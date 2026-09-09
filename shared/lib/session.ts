import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { LOGIN_PATH } from '@/shared/constant/route'
import { getAuth } from '@/shared/lib/auth'

export const getServerSession = cache(async () => getAuth().api.getSession({ headers: await headers() }))

export const requireUser = async () => {
    const session = await getServerSession()
    if (!session) redirect(LOGIN_PATH)
    return session.user
}
