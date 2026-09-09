import type { FC } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

const FIELD_ROWS = [0, 1, 2, 3]

export const TripEditorSkeleton: FC = () => (
    <div className='flex flex-col gap-px bg-background'>
        <div className='flex items-center justify-between gap-2 bg-card p-3'>
            <Skeleton className='h-5 w-48' />
            <Skeleton className='h-8 w-20' />
        </div>
        <div className='flex flex-wrap gap-2 bg-card p-3'>
            {FIELD_ROWS.map((row) => (
                <Skeleton key={row} className='h-8 w-24' />
            ))}
        </div>
        <div className='flex flex-col gap-3 bg-card p-3'>
            <Skeleton className='h-4 w-32' />
            {FIELD_ROWS.map((row) => (
                <Skeleton key={row} className='h-8 w-full' />
            ))}
        </div>
        <div className='flex items-center justify-end gap-2 bg-card p-3'>
            <Skeleton className='h-8 w-20' />
            <Skeleton className='h-8 w-16' />
        </div>
    </div>
)
