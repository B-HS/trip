import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { requireUser } from '@/shared/lib/session'
import { AppShell } from '@/widgets/app-shell/app-shell'
import { SIDEBAR_COOKIE_NAME, SIDEBAR_STATE_COLLAPSED } from '@/widgets/app-shell/app-shell.constant'

const AppLayout = async ({ children }: PropsWithChildren) => {
    const user = await requireUser()
    const cookieStore = await cookies()

    return (
        <AppShell
            user={{ id: user.id, name: user.name, email: user.email, username: user.username ?? null, image: user.image ?? null }}
            defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === SIDEBAR_STATE_COLLAPSED}>
            {children}
        </AppShell>
    )
}

export default AppLayout
