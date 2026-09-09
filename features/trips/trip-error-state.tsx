'use client'

import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'

type TripErrorStateProps = {
    isRetrying: boolean
    onRetry: () => void
}

export const TripErrorState: FC<TripErrorStateProps> = ({ isRetrying, onRetry }) => (
    <Empty className='gap-6 rounded-none border-none bg-card p-3'>
        <EmptyHeader className='gap-2'>
            <EmptyMedia className='mb-0 text-destructive'>
                <TriangleAlertIcon className='size-6' aria-hidden />
            </EmptyMedia>
            <EmptyTitle className='text-sm font-medium'>트립 목록을 불러오지 못했습니다</EmptyTitle>
            <EmptyDescription className='text-xs'>요청이 실패했습니다. 잠시 후 다시 시도하세요.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button variant='outline' size='sm' disabled={isRetrying} onClick={onRetry}>
                <RotateCcwIcon aria-hidden />
                {isRetrying ? '다시 불러오는 중…' : '다시 시도'}
            </Button>
        </EmptyContent>
    </Empty>
)
