import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getAuth } from '@/shared/lib/auth'

export const getServerSession = async () => {
    await connection()
    return getAuth().api.getSession({ headers: await headers() })
}

export const requireUser = async () => {
    const session = await getServerSession()
    if (!session) redirect('/login')
    return session.user
}
