import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prefetchTripList } from '@/entities/trip/trip.prefetch'
import { TripListSkeleton } from '@/features/trips/trip-list-skeleton'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { TripListWidget } from '@/widgets/trips/trip-list-widget'

export const metadata: Metadata = {
    title: '내 트립',
    description: '참여 중인 트립 목록을 확인하고 새 트립을 만듭니다.',
}

const TripListBoundary = async () => {
    const user = await requireUser()
    const queryClient = getQueryClient()
    await prefetchTripList(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripListWidget />
        </HydrationBoundary>
    )
}

const TripsPage = () => (
    <Suspense fallback={<TripListSkeleton />}>
        <TripListBoundary />
    </Suspense>
)

export default TripsPage
