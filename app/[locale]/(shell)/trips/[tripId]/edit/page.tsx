import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { getTripRole } from '@/entities/trip/trip.access'
import { getTripDetail } from '@/entities/trip/trip.cache'
import { prefetchTripDetail, prefetchTripMembers } from '@/entities/trip/trip.prefetch'
import { canEdit, canManage } from '@/entities/trip/trip.role'
import { getQueryClient } from '@/shared/lib/query-client'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { TripEditorWidget } from '@/widgets/trip-editor/trip-editor-widget'

type TripEditPageProps = {
    params: Promise<{ locale: string; tripId: string }>
}

export const generateMetadata = async ({ params }: TripEditPageProps) => {
    const { locale, tripId } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripEdit' })
    const detail = await getTripDetail(tripId)
    return { title: detail === null ? t('title') : t('titleWithTrip', { title: detail.title }) }
}

const TripEditPage = async ({ params }: TripEditPageProps) => {
    const { locale, tripId } = await params
    const user = await requireUser()
    const [detail, role] = await Promise.all([getTripDetail(tripId), getTripRole(tripId, user.id)])
    if (detail === null) notFound()
    if (!canEdit(role)) redirect({ href: `/trips/${tripId}`, locale })

    const queryClient = getQueryClient()
    await prefetchTripDetail(queryClient, tripId, user.id)
    if (canManage(role)) await prefetchTripMembers(queryClient, tripId)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripEditorWidget tripId={tripId} isUploadEnabled={getUploadConfig() !== null} />
        </HydrationBoundary>
    )
}

export default TripEditPage
