import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getTripRole } from '@/entities/trip/trip.access'
import { getTripDetail } from '@/entities/trip/trip.cache'
import { findTripUserState } from '@/entities/user-state/user-state.repository'
import { TripPrintDocument } from '@/features/trip-print/trip-print-document'
import { TripPrintToolbar } from '@/features/trip-print/trip-print-toolbar'
import { createPageMetadata } from '@/shared/lib/metadata'
import { getServerSession, requireUser } from '@/shared/lib/session'

type TripPrintPageProps = {
    params: Promise<{ locale: string; tripId: string }>
}

export const generateMetadata = async ({ params }: TripPrintPageProps): Promise<Metadata> => {
    const { locale, tripId } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripDetail' })
    const session = await getServerSession()
    const role = session ? await getTripRole(tripId, session.user.id) : null
    if (!role) return createPageMetadata({ locale, path: `/trips/${encodeURIComponent(tripId)}/print`, title: t('fallbackTitle'), indexable: false })
    const trip = await getTripDetail(tripId)
    return createPageMetadata({
        locale,
        path: `/trips/${encodeURIComponent(tripId)}/print`,
        title: trip?.title ?? t('fallbackTitle'),
        indexable: false,
    })
}

const TripPrintPage = async ({ params }: TripPrintPageProps) => {
    const { locale, tripId } = await params
    setRequestLocale(locale)
    const user = await requireUser()

    // Membership is checked before the trip graph or any per-user state is loaded.
    const role = await getTripRole(tripId, user.id)
    if (!role) notFound()
    const trip = await getTripDetail(tripId)
    if (!trip) notFound()
    const viewerState = await findTripUserState(tripId, user.id)

    return (
        <div className='trip-print-surface min-h-dvh bg-background text-foreground'>
            <TripPrintToolbar backHref={`/trips/${encodeURIComponent(tripId)}`} />
            <TripPrintDocument trip={trip} locale={locale} viewerState={viewerState} />
        </div>
    )
}

export default TripPrintPage
