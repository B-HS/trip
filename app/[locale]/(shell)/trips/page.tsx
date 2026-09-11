import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prefetchTripList } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { TripListWidget } from '@/widgets/trips/trip-list-widget'

type TripsPageProps = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ route?: string | string[] }>
}

export const generateMetadata = async ({ params }: TripsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.trips' })
    return { title: t('title'), description: t('description') }
}

const resolveRouteKey = (value: string | string[] | undefined) => (typeof value === 'string' && value.length > 0 ? value : null)

const TripsPage = async ({ searchParams }: TripsPageProps) => {
    const [user, { route }] = await Promise.all([requireUser(), searchParams])
    const queryClient = getQueryClient()
    await prefetchTripList(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TripListWidget initialRoute={resolveRouteKey(route)} />
        </HydrationBoundary>
    )
}

export default TripsPage
