import type { FC } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

const TILE_COUNT = 4

export const TripCardsSkeleton: FC = () => (
    <div className='flex flex-col gap-px'>
        <div className='grid grid-cols-2 gap-px bg-background lg:grid-cols-4'>
            {Array.from({ length: TILE_COUNT }, (_, index) => (
                <div key={index} className='bg-card p-3'>
                    <Skeleton className='h-14 w-full rounded-none' />
                </div>
            ))}
        </div>
        <div className='bg-card p-3'>
            <Skeleton className='h-96 w-full rounded-none' />
        </div>
    </div>
)
