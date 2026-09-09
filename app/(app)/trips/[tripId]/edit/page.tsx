import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound, redirect } from 'next/navigation'
import { getTripRole } from '@/entities/trip/trip.access'
import { getTripDetail } from '@/entities/trip/trip.cache'
import { prefetchTripDetail, prefetchTripMembers } from '@/entities/trip/trip.prefetch'
import { canEdit, canManage } from '@/entities/trip/trip.role'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { TripEditorWidget } from '@/widgets/trip-editor/trip-editor-widget'

type TripEditPageProps = {
    params: Promise<{ tripId: string }>
}

export const generateMetadata = async ({ params }: TripEditPageProps) => {
    const { tripId } = await params
    const detail = await getTripDetail(tripId)
    return { title: detail === null ? '편집' : `편집 · ${detail.title}` }
}

const TripEditPage = async ({ params }: TripEditPageProps) => {
    const { tripId } = await params
    const user = await requireUser()
    const [detail, role] = await Promise.all([getTripDetail(tripId), getTripRole(tripId, user.id)])
    if (detail === null) notFound()
    if (!canEdit(role)) redirect(`/trips/${tripId}`)

    const queryClient = getQueryClient()
    await prefetchTripDetail(queryClient, tripId, user.id)
    if (canManage(role)) await prefetchTripMembers(queryClient, tripId)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripEditorWidget tripId={tripId} />
        </HydrationBoundary>
    )
}

export default TripEditPage
