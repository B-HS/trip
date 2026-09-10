import type { FC } from 'react'
import type { PublicTripCard as PublicTripCardItem } from '@/entities/trip/trip.type'
import { PublicTripCard } from '@/features/community/public-trip-card'
import { cn } from '@/shared/lib/utils'

const AUTO_FIT_COLUMNS_CLASS = 'grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]'

export type PublicTripGridProps = {
    trips: PublicTripCardItem[]
    emptyLabel: string
    className?: string
}

export const PublicTripGrid: FC<PublicTripGridProps> = ({ trips, emptyLabel, className }) => {
    if (trips.length === 0) return <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{emptyLabel}</p>

    return (
        <ul className={cn('grid gap-px bg-background', AUTO_FIT_COLUMNS_CLASS, className)}>
            {trips.map((trip) => (
                <li key={trip.id} className='flex min-w-0'>
                    <PublicTripCard trip={trip} />
                </li>
            ))}
        </ul>
    )
}
