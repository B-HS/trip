import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuth } from '@/shared/lib/auth'

export const getServerSession = async () => getAuth().api.getSession({ headers: await headers() })

export const requireUser = async () => {
    const session = await getServerSession()
    if (!session) redirect('/login')
    return session.user
}
