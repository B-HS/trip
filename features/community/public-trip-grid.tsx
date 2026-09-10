import type { FC } from 'react'
import type { PublicTripCard as PublicTripCardItem } from '@/entities/trip/trip.type'
import { PublicTripCard } from '@/features/community/public-trip-card'
import { cn } from '@/shared/lib/utils'

export type PublicTripGridProps = {
    trips: PublicTripCardItem[]
    emptyLabel: string
    className?: string
}

export const PublicTripGrid: FC<PublicTripGridProps> = ({ trips, emptyLabel, className }) => {
    if (trips.length === 0) return <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{emptyLabel}</p>

    return (
        <ul className={cn('grid grid-cols-1 gap-px bg-background sm:grid-cols-2 lg:grid-cols-3', className)}>
            {trips.map((trip) => (
                <li key={trip.id} className='flex min-w-0'>
                    <PublicTripCard trip={trip} />
                </li>
            ))}
        </ul>
    )
}
