import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getCachedPublicTrip } from '@/entities/trip/trip.cache'
import { TripViewerSkeleton } from '@/features/trip-viewer/trip-viewer-skeleton'
import { SITE_NAME } from '@/shared/constant/site'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'

type SharedTripPageProps = {
    params: Promise<{ slug: string }>
}

const NOT_FOUND_TITLE = '공개된 여행을 찾을 수 없습니다'

const buildDescription = (destination: string, periodNote: string | null) =>
    periodNote ? `${destination} · ${periodNote}` : `${destination} 여행 일정`

export const generateMetadata = async ({ params }: SharedTripPageProps): Promise<Metadata> => {
    const { slug } = await params
    const trip = await getCachedPublicTrip(slug)
    if (!trip) return { title: NOT_FOUND_TITLE }
    const description = buildDescription(trip.destination, trip.periodNote)
    return {
        title: trip.title,
        description,
        openGraph: { title: trip.title, description, siteName: SITE_NAME, locale: 'ko_KR', type: 'article' },
    }
}

const SharedTripContent = async ({ params }: SharedTripPageProps) => {
    const { slug } = await params
    const trip = await getCachedPublicTrip(slug)
    if (!trip) notFound()

    return <TripViewerWidget mode='public' initialTrip={trip} />
}

const SharedTripPage = ({ params }: SharedTripPageProps) => (
    <div className='mx-auto w-full max-w-(--content-max-width) p-3'>
        <Suspense fallback={<TripViewerSkeleton />}>
            <SharedTripContent params={params} />
        </Suspense>
    </div>
)

export default SharedTripPage
