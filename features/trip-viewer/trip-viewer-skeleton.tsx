import type { FC } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

const SIDEBAR_BLOCK_COUNT = 4
const DAY_TAB_COUNT = 7
const TIMELINE_ROW_COUNT = 6

const range = (length: number) => Array.from({ length }, (_, index) => index)

export const TripViewerSkeleton: FC = () => (
    <div className='grid w-full grid-cols-1 gap-px bg-background md:grid-cols-[16rem_minmax(0,1fr)]'>
        <div className='flex flex-col gap-3 bg-card p-3'>
            <Skeleton className='h-3 w-28 rounded-none' />
            <Skeleton className='h-8 w-40 rounded-none' />
            <Skeleton className='h-4 w-32 rounded-none' />
            <Skeleton className='h-1 w-full rounded-none' />
            {range(SIDEBAR_BLOCK_COUNT).map((index) => (
                <Skeleton key={index} className='h-12 w-full rounded-none' />
            ))}
        </div>
        <div className='flex min-w-0 flex-col gap-px'>
            <div className='flex items-center justify-between gap-2 bg-card p-3'>
                <Skeleton className='h-9 w-64 rounded-none' />
                <Skeleton className='h-8 w-28 rounded-none' />
            </div>
            <div className='flex gap-px'>
                {range(DAY_TAB_COUNT).map((index) => (
                    <Skeleton key={index} className='h-16 min-w-20 flex-1 rounded-none' />
                ))}
            </div>
            <Skeleton className='h-20 w-full rounded-none' />
            {range(TIMELINE_ROW_COUNT).map((index) => (
                <div key={index} className='grid grid-cols-1 gap-px sm:grid-cols-[7rem_minmax(0,1fr)]'>
                    <Skeleton className='h-14 rounded-none' />
                    <Skeleton className='h-14 rounded-none' />
                </div>
            ))}
        </div>
    </div>
)
