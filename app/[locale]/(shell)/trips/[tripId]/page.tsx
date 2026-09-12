import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getTripRole } from '@/entities/trip/trip.access'
import { getTripDetail } from '@/entities/trip/trip.cache'
import { prefetchTripDetail } from '@/entities/trip/trip.prefetch'
import type { TripDetail } from '@/entities/trip/trip.type'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { TRIP_VIEWS, type TripView } from '@/shared/constant/trip'
import { getQueryClient } from '@/shared/lib/query-client'
import { getServerSession, requireUser } from '@/shared/lib/session'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'
import { createPageMetadata } from '@/shared/lib/metadata'

type TripDetailPageProps = {
    params: Promise<{ locale: string; tripId: string }>
    searchParams: Promise<{ view?: string; day?: string }>
}

const resolveView = (value: string | undefined): TripView | undefined => TRIP_VIEWS.find((view) => view === value)

const resolveDayOrdinal = (value: string | undefined) => {
    const parsed = Number.parseInt(value ?? '', 10)
    return Number.isInteger(parsed) ? parsed : undefined
}

export const generateMetadata = async ({ params }: TripDetailPageProps): Promise<Metadata> => {
    const { locale, tripId } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripDetail' })
    const fallbackTitle = t('fallbackTitle')
    const session = await getServerSession()
    if (!session) return createPageMetadata({ locale, path: `/trips/${encodeURIComponent(tripId)}`, title: fallbackTitle, indexable: false })
    const role = await getTripRole(tripId, session.user.id)
    if (!role) return createPageMetadata({ locale, path: `/trips/${encodeURIComponent(tripId)}`, title: fallbackTitle, indexable: false })
    const trip = await getTripDetail(tripId)
    if (!trip) return createPageMetadata({ locale, path: `/trips/${encodeURIComponent(tripId)}`, title: fallbackTitle, indexable: false })
    const description = trip.periodNote
        ? t('descriptionWithPeriod', { destination: trip.destination, periodNote: trip.periodNote })
        : t('descriptionDefault', { destination: trip.destination })
    return createPageMetadata({ locale, path: `/trips/${encodeURIComponent(tripId)}`, title: trip.title, description, indexable: false })
}

const TripDetailPage = async ({ params, searchParams }: TripDetailPageProps) => {
    const [{ tripId }, { view, day }] = await Promise.all([params, searchParams])
    const user = await requireUser()
    const queryClient = getQueryClient()
    await prefetchTripDetail(queryClient, tripId, user.id)
    if (!queryClient.getQueryData<TripDetail>(QUERY_KEY.TRIP.DETAIL(tripId))) notFound()

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripViewerWidget tripId={tripId} mode='member' initialView={resolveView(view)} initialDayOrdinal={resolveDayOrdinal(day)} />
        </HydrationBoundary>
    )
}

export default TripDetailPage
