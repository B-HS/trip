import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { prefetchFavoriteTrips } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { AppShell } from '@/widgets/app-shell/app-shell'
import { SIDEBAR_COOKIE_NAME, SIDEBAR_STATE_COLLAPSED } from '@/widgets/app-shell/app-shell.constant'

const AppLayout = async ({ children }: PropsWithChildren) => {
    const user = await requireUser()
    const cookieStore = await cookies()
    const queryClient = getQueryClient()
    await prefetchFavoriteTrips(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AppShell
                user={{ id: user.id, name: user.name, email: user.email, username: user.username ?? null, image: user.image ?? null }}
                defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === SIDEBAR_STATE_COLLAPSED}>
                {children}
            </AppShell>
        </HydrationBoundary>
    )
}

export default AppLayout
