import type { FC } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

export const TripCreateSkeleton: FC = () => (
    <div className='flex flex-col gap-px'>
        <div className='bg-card p-3'>
            <Skeleton className='h-24 w-full rounded-none' />
        </div>
        <div className='grid gap-px lg:grid-cols-2'>
            <div className='bg-card p-3'>
                <Skeleton className='h-96 w-full rounded-none' />
            </div>
            <div className='bg-card p-3'>
                <Skeleton className='h-24 w-full rounded-none' />
            </div>
        </div>
    </div>
)
