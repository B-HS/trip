import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicTrip } from '@/entities/trip/trip.cache'
import { SITE_NAME } from '@/shared/constant/site'
import { TripViewerWidget } from '@/widgets/trip-viewer/trip-viewer-widget'

type SharedTripPageProps = {
    params: Promise<{ slug: string }>
}

export const revalidate = 3600

const NOT_FOUND_TITLE = '공개된 여행을 찾을 수 없습니다'

const buildDescription = (destination: string, periodNote: string | null) =>
    periodNote ? `${destination} · ${periodNote}` : `${destination} 여행 일정`

export const generateMetadata = async ({ params }: SharedTripPageProps): Promise<Metadata> => {
    const { slug } = await params
    const trip = await getPublicTrip(slug)
    if (!trip) return { title: NOT_FOUND_TITLE }
    const description = buildDescription(trip.destination, trip.periodNote)
    return {
        title: trip.title,
        description,
        openGraph: { title: trip.title, description, siteName: SITE_NAME, locale: 'ko_KR', type: 'article' },
    }
}

const SharedTripPage = async ({ params }: SharedTripPageProps) => {
    const { slug } = await params
    const trip = await getPublicTrip(slug)
    if (!trip) notFound()

    return (
        <div className='mx-auto w-full max-w-(--content-max-width) p-3'>
            <TripViewerWidget mode='public' initialTrip={trip} />
        </div>
    )
}

export default SharedTripPage
