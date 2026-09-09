import { cookies } from 'next/headers'
import { Suspense, type PropsWithChildren } from 'react'
import { requireUser } from '@/shared/lib/session'
import { Skeleton } from '@/shared/ui/skeleton'
import { AppShell } from '@/widgets/app-shell/app-shell'
import { SIDEBAR_COOKIE_NAME, SIDEBAR_STATE_COLLAPSED } from '@/widgets/app-shell/app-shell.constant'

const AppShellBoundary = async ({ children }: PropsWithChildren) => {
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

const AppLayout = ({ children }: PropsWithChildren) => (
    <Suspense
        fallback={
            <div className='flex h-dvh min-h-0 w-full'>
                <Skeleton className='hidden h-full w-64 shrink-0 rounded-none md:block' />
                <div className='min-w-0 flex-1 p-3'>
                    <Skeleton className='h-24 w-full rounded-none' />
                </div>
            </div>
        }>
        <AppShellBoundary>{children}</AppShellBoundary>
    </Suspense>
)

export default AppLayout
