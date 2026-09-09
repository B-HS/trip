import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getTripRole } from '@/entities/trip/trip.access'
import { getCachedTripDetail } from '@/entities/trip/trip.cache'
import { prefetchTripDetail } from '@/entities/trip/trip.prefetch'
import type { TripDetail } from '@/entities/trip/trip.type'
import { TripViewerSkeleton } from '@/features/trip-viewer/trip-viewer-skeleton'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { getQueryClient } from '@/shared/lib/query-client'
import { getServerSession, requireUser } from '@/shared/lib/session'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'

type TripDetailPageProps = {
    params: Promise<{ tripId: string }>
}

const FALLBACK_TITLE = '여행'

export const generateMetadata = async ({ params }: TripDetailPageProps): Promise<Metadata> => {
    const { tripId } = await params
    const session = await getServerSession()
    if (!session) return { title: FALLBACK_TITLE }
    const role = await getTripRole(tripId, session.user.id)
    if (!role) return { title: FALLBACK_TITLE }
    const trip = await getCachedTripDetail(tripId)
    if (!trip) return { title: FALLBACK_TITLE }
    return { title: trip.title, description: trip.periodNote ? `${trip.destination} · ${trip.periodNote}` : `${trip.destination} 여행 일정` }
}

const TripDetailPage = async ({ params }: TripDetailPageProps) => {
    const { tripId } = await params
    const user = await requireUser()
    const queryClient = getQueryClient()
    await prefetchTripDetail(queryClient, tripId, user.id)
    if (!queryClient.getQueryData<TripDetail>(QUERY_KEY.TRIP.DETAIL(tripId))) notFound()

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<TripViewerSkeleton />}>
                <TripViewerWidget tripId={tripId} mode='member' />
            </Suspense>
        </HydrationBoundary>
    )
}

export default TripDetailPage
