import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPublicTrip } from '@/entities/trip/trip.cache'
import { TripPrintDocument } from '@/features/trip-print/trip-print-document'
import { TripPrintToolbar } from '@/features/trip-print/trip-print-toolbar'
import { createPageMetadata } from '@/shared/lib/metadata'

type SharedTripPrintPageProps = {
    params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: SharedTripPrintPageProps): Promise<Metadata> => {
    const { locale, slug } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripDetail' })
    const trip = await getPublicTrip(slug)
    return createPageMetadata({
        locale,
        path: `/s/${encodeURIComponent(slug)}/print`,
        title: trip?.title ?? t('fallbackTitle'),
        indexable: false,
    })
}

const SharedTripPrintPage = async ({ params }: SharedTripPrintPageProps) => {
    const { locale, slug } = await params
    setRequestLocale(locale)
    const trip = await getPublicTrip(slug)
    if (!trip || !trip.isPublic) notFound()

    return (
        <div className='trip-print-surface min-h-dvh bg-background text-foreground'>
            <TripPrintToolbar backHref={`/s/${encodeURIComponent(slug)}`} />
            <TripPrintDocument trip={trip} locale={locale} />
        </div>
    )
}

export default SharedTripPrintPage
