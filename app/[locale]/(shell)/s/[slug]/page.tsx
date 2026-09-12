import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPublicTrip } from '@/entities/trip/trip.cache'
import { prefetchTripLike } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { getServerSession } from '@/shared/lib/session'
import { cn } from '@/shared/lib/utils'
import { PublicTripActions } from '@/widgets/trip-viewer/public-trip-actions'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'
import { createPageMetadata } from '@/shared/lib/metadata'
import { buildTouristTripJsonLd } from '@/shared/lib/json-ld'
import { localizedUrl } from '@/shared/lib/seo'
import { JsonLdScript } from '@/features/seo/json-ld-script'
import { TripPublicSummary } from '@/features/seo/trip-public-summary'

type SharedTripPageProps = {
    params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: SharedTripPageProps): Promise<Metadata> => {
    const { locale, slug } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripDetail' })
    const notFoundTitle = await getTranslations({ locale, namespace: 'metadata.sharedTripNotFound' })
    const trip = await getPublicTrip(slug)
    if (!trip) return createPageMetadata({ locale, path: `/s/${encodeURIComponent(slug)}`, title: notFoundTitle('title'), indexable: false })
    const description = trip.periodNote
        ? t('descriptionWithPeriod', { destination: trip.destination, periodNote: trip.periodNote })
        : t('descriptionDefault', { destination: trip.destination })
    return createPageMetadata({
        locale,
        path: `/s/${encodeURIComponent(slug)}`,
        title: trip.title,
        description,
        type: 'article',
    })
}

const SharedTripPage = async ({ params }: SharedTripPageProps) => {
    const { locale, slug } = await params
    const trip = await getPublicTrip(slug)
    if (!trip) notFound()

    const session = await getServerSession()
    const queryClient = getQueryClient()
    await prefetchTripLike(queryClient, trip.id, session?.user.id ?? null)

    const tripUrl = localizedUrl(`/s/${encodeURIComponent(slug)}`, locale)
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <JsonLdScript data={buildTouristTripJsonLd(trip, tripUrl, trip.periodNote ?? trip.destination)} />
            <div className={cn('flex flex-1 flex-col gap-px', session === null && 'mx-auto w-full max-w-(--content-max-width) p-3')}>
                <PublicTripActions trip={trip} slug={slug} isSignedIn={session !== null} />
                <TripPublicSummary trip={trip} />
                <TripViewerWidget mode='public' initialTrip={trip} />
            </div>
        </HydrationBoundary>
    )
}

export default SharedTripPage
