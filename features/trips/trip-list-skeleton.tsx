import type { FC } from 'react'
import { TripCardsSkeleton } from '@/features/trips/trip-cards-skeleton'
import { Skeleton } from '@/shared/ui/skeleton'

export const TripListSkeleton: FC = () => (
    <div className='flex flex-col gap-px'>
        <div className='bg-card p-3'>
            <Skeleton className='h-24 w-full rounded-none' />
        </div>
        <TripCardsSkeleton />
    </div>
)
