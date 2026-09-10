'use client'

import { PlusIcon, SparklesIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FC } from 'react'
import { useCreateTripFromTemplate, useToggleFavorite, useTripList } from '@/entities/trip/trip.query'
import { TripCard } from '@/features/trips/trip-card'
import { TripCardsSkeleton } from '@/features/trips/trip-cards-skeleton'
import { TripEmptyState } from '@/features/trips/trip-empty-state'
import { TripErrorState } from '@/features/trips/trip-error-state'
import { TripStatTiles, type TripStatTile } from '@/features/trips/trip-stat-tiles'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { MEMBER_ROLE_LABEL } from '@/shared/constant/trip'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { replaceSearchParam } from '@/shared/lib/search-param'
import { formatTripDateRange } from '@/shared/lib/trip-date-range'
import { formatTripLength } from '@/shared/lib/trip-length'
import { resolveTripRouteLabel } from '@/shared/lib/trip-route-label'
import { Button } from '@/shared/ui/button'
import { FadeIn } from '@/shared/ui/motion/fade-in'
import { StaggerList } from '@/shared/ui/motion/stagger-list'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'
import { TripDeleteDialog, type TripDeleteTarget } from '@/widgets/trips/trip-delete-dialog'
import { collectGlobeRoutes, countOngoingTrips, deriveTripStatus, filterTripsByRoute, findGlobeRoute } from '@/widgets/trips/trip-summary.derive'
import { useToday } from '@/widgets/trips/use-today'

const NEW_TRIP_PATH = '/trips/new'
const ROUTE_PARAM = 'route'
const GLOBE_DELAY = 0.06
const CARD_ITEM_VARIANTS = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }
const CARD_EXIT = { opacity: 0, y: -8 }
const CARD_TRANSITION = { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }

export type TripListWidgetProps = {
    initialRoute?: string | null
}

export const TripListWidget: FC<TripListWidgetProps> = ({ initialRoute = null }) => {
    const [deleteTarget, setDeleteTarget] = useState<TripDeleteTarget | null>(null)
    const [selectedRouteKey, setSelectedRouteKey] = useState(initialRoute)
    const router = useRouter()
    const today = useToday()
    const tripList = useTripList()
    const createFromTemplate = useCreateTripFromTemplate()
    const toggleFavorite = useToggleFavorite()

    const trips = tripList.data ?? []
    const globeRoutes = collectGlobeRoutes(trips)
    const selectedRoute = findGlobeRoute(globeRoutes, selectedRouteKey)
    const hasStaleRoute = tripList.data !== undefined && selectedRouteKey !== null && selectedRoute === null
    if (hasStaleRoute) setSelectedRouteKey(null)
    const visibleTrips = filterTripsByRoute(trips, selectedRoute)
    const tiles: TripStatTile[] = [
        { label: '트립 수', value: trips.length },
        { label: '일정 수', value: trips.reduce((total, trip) => total + trip.scheduleCount, 0) },
        { label: '예매 항목', value: trips.reduce((total, trip) => total + trip.bookingCount, 0) },
        { label: '진행 중', value: countOngoingTrips(trips, today) },
    ]

    const handleCreateSample = () => createFromTemplate.mutate(OSAKA_TRIP_TEMPLATE, { onSuccess: (created) => router.push(`/trips/${created.id}`) })

    const handleSelectRoute = (key: string) => setSelectedRouteKey(key === selectedRouteKey ? null : key)

    const renderCards = () => (
        <StaggerList as='ul' className='flex flex-col gap-px'>
            <AnimatePresence>
                {visibleTrips.map((trip) => (
                    <motion.li key={trip.id} layout variants={CARD_ITEM_VARIANTS} exit={CARD_EXIT} transition={CARD_TRANSITION}>
                        <TripCard
                            tripId={trip.id}
                            title={trip.title}
                            eyebrow={trip.eyebrow}
                            destination={trip.destination}
                            dateRangeLabel={formatTripDateRange(trip)}
                            destinations={trip.destinations}
                            routeLabel={resolveTripRouteLabel(trip.flights)}
                            isFavorite={trip.isFavorite}
                            status={deriveTripStatus(trip, today)}
                            roleLabel={MEMBER_ROLE_LABEL[trip.role]}
                            lengthLabel={formatTripLength({
                                startDate: trip.startDate,
                                endDate: trip.endDate,
                                nights: trip.customNights,
                                days: trip.customDays,
                            })}
                            scheduleCount={trip.scheduleCount}
                            bookingCount={trip.bookingCount}
                            canEdit={trip.role !== 'viewer'}
                            canDelete={trip.role === 'owner'}
                            onDelete={() => setDeleteTarget({ id: trip.id, title: trip.title })}
                            onToggleFavorite={() => toggleFavorite.mutate({ tripId: trip.id, isFavorite: !trip.isFavorite })}
                        />
                    </motion.li>
                ))}
            </AnimatePresence>
        </StaggerList>
    )

    const renderTrips = () => {
        if (tripList.isPending) return <TripCardsSkeleton />
        if (tripList.isError) return <TripErrorState isRetrying={tripList.isFetching} onRetry={() => tripList.refetch()} />

        return (
            <>
                <TripStatTiles tiles={tiles} />
                <section className='flex flex-wrap items-stretch gap-px bg-background'>
                    <Button variant='cellPrimary' size='cell' asChild>
                        <Link href={NEW_TRIP_PATH}>
                            <PlusIcon aria-hidden />새 트립
                        </Link>
                    </Button>
                    <Button variant='cell' size='cell' disabled={createFromTemplate.isPending} onClick={handleCreateSample}>
                        <SparklesIcon aria-hidden />
                        {createFromTemplate.isPending ? '만드는 중…' : '오사카 예시 트립 만들기'}
                    </Button>
                    {selectedRoute !== null && (
                        <Button variant='cell' size='cell' onClick={() => handleSelectRoute(selectedRoute.key)}>
                            <XIcon aria-hidden />
                            {`${selectedRoute.codeLabel} 필터 해제`}
                        </Button>
                    )}
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </section>
                {trips.length === 0 ? (
                    <TripEmptyState newTripHref={NEW_TRIP_PATH} isSamplePending={createFromTemplate.isPending} onCreateSample={handleCreateSample} />
                ) : (
                    renderCards()
                )}
            </>
        )
    }

    useEffect(() => {
        if (tripList.data === undefined) return
        replaceSearchParam(ROUTE_PARAM, selectedRouteKey)
    }, [selectedRouteKey, tripList.data])

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <FadeIn as='section' className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>TRIPS</p>
                <h1 className='text-2xl font-semibold tracking-tight'>내 트립</h1>
                <p className='text-xs text-muted-foreground'>참여 중인 트립을 모아 봅니다. 카드를 열면 일정과 예매 체크리스트로 이동합니다.</p>
            </FadeIn>
            <FadeIn as='section' className='bg-card p-3' delay={GLOBE_DELAY}>
                {globeRoutes.length > 0 ? (
                    <TripGlobeLazy
                        routes={globeRoutes}
                        variant='panel'
                        dragRotate
                        showTooltip
                        selectedKey={selectedRoute?.key ?? null}
                        onRouteSelect={handleSelectRoute}
                    />
                ) : (
                    <p className='py-6 text-center text-xs text-muted-foreground'>목적지나 항공편을 등록하면 전체 경로가 지구본에 표시됩니다.</p>
                )}
            </FadeIn>
            {renderTrips()}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
            <TripDeleteDialog target={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
        </div>
    )
}
