import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { prefetchFavoriteTrips } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { AppShell, type AppShellUser } from '@/widgets/app-shell/app-shell'
import { SIDEBAR_COOKIE_NAME, SIDEBAR_STATE_COLLAPSED } from '@/widgets/app-shell/app-shell.constant'

export const AppFrame = async ({ user, children }: PropsWithChildren<{ user: AppShellUser }>) => {
    const cookieStore = await cookies()
    const queryClient = getQueryClient()
    await prefetchFavoriteTrips(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AppShell user={user} defaultCollapsed={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === SIDEBAR_STATE_COLLAPSED}>
                {children}
            </AppShell>
        </HydrationBoundary>
    )
}
