'use client'

import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'

type TripErrorStateProps = {
    isRetrying: boolean
    onRetry: () => void
}

export const TripErrorState: FC<TripErrorStateProps> = ({ isRetrying, onRetry }) => {
    const t = useTranslations('trips.error')
    return (
        <Empty className='gap-6 rounded-none border-none bg-card p-3'>
            <EmptyHeader className='gap-2'>
                <EmptyMedia className='mb-0 text-destructive'>
                    <TriangleAlertIcon className='size-6' aria-hidden />
                </EmptyMedia>
                <EmptyTitle className='text-sm font-medium'>{t('title')}</EmptyTitle>
                <EmptyDescription className='text-xs'>{t('description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant='outline' size='sm' disabled={isRetrying} onClick={onRetry}>
                    <RotateCcwIcon aria-hidden />
                    {isRetrying ? t('retrying') : t('retry')}
                </Button>
            </EmptyContent>
        </Empty>
    )
}
