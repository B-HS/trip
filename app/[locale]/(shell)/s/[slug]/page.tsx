import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { openGraphLocale } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getPublicTrip } from '@/entities/trip/trip.cache'
import { prefetchTripLike } from '@/entities/trip/trip.prefetch'
import { SITE_NAME } from '@/shared/constant/site'
import { getQueryClient } from '@/shared/lib/query-client'
import { getServerSession } from '@/shared/lib/session'
import { cn } from '@/shared/lib/utils'
import { PublicTripActions } from '@/widgets/trip-viewer/public-trip-actions'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'

type SharedTripPageProps = {
    params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: SharedTripPageProps): Promise<Metadata> => {
    const { locale, slug } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripDetail' })
    const notFoundTitle = await getTranslations({ locale, namespace: 'metadata.sharedTripNotFound' })
    const trip = await getPublicTrip(slug)
    if (!trip) return { title: notFoundTitle('title') }
    const description = trip.periodNote
        ? t('descriptionWithPeriod', { destination: trip.destination, periodNote: trip.periodNote })
        : t('descriptionDefault', { destination: trip.destination })
    return {
        title: trip.title,
        description,
        openGraph: { title: trip.title, description, siteName: SITE_NAME, locale: openGraphLocale(locale), type: 'article' },
    }
}

const SharedTripPage = async ({ params }: SharedTripPageProps) => {
    const { slug } = await params
    const trip = await getPublicTrip(slug)
    if (!trip) notFound()

    const session = await getServerSession()
    const queryClient = getQueryClient()
    await prefetchTripLike(queryClient, trip.id, session?.user.id ?? null)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className={cn('flex flex-1 flex-col gap-px', session === null && 'mx-auto w-full max-w-(--content-max-width) p-3')}>
                <PublicTripActions trip={trip} slug={slug} isSignedIn={session !== null} />
                <TripViewerWidget mode='public' initialTrip={trip} />
            </div>
        </HydrationBoundary>
    )
}

export default SharedTripPage
