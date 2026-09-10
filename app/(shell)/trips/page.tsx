import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { prefetchTripList } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { TripListWidget } from '@/widgets/trips/trip-list-widget'

type TripsPageProps = {
    searchParams: Promise<{ route?: string | string[] }>
}

export const metadata: Metadata = {
    title: '내 트립',
    description: '참여 중인 트립 목록을 확인하고 새 트립을 만듭니다.',
}

const resolveRouteKey = (value: string | string[] | undefined) => (typeof value === 'string' && value.length > 0 ? value : null)

const TripsPage = async ({ searchParams }: TripsPageProps) => {
    const [user, { route }] = await Promise.all([requireUser(), searchParams])
    const queryClient = getQueryClient()
    await prefetchTripList(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripListWidget initialRoute={resolveRouteKey(route)} />
        </HydrationBoundary>
    )
}

export default TripsPage
