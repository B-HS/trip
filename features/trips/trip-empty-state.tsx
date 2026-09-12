'use client'

import { PlusIcon, SparklesIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { ComponentProps, FC } from 'react'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/empty'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'

const SAMPLE_ROUTES = [{ from: 'ICN', to: 'KIX' }]

type TripEmptyStateProps = {
    newTripHref: ComponentProps<typeof Link>['href']
    isSamplePending: boolean
    onCreateSample: () => void
}

export const TripEmptyState: FC<TripEmptyStateProps> = ({ newTripHref, isSamplePending, onCreateSample }) => {
    const t = useTranslations('trips.empty')
    return (
        <Empty className='gap-6 rounded-none border-none bg-card p-3'>
            <TripGlobeLazy className='max-w-md' routes={SAMPLE_ROUTES} variant='panel' interactive={false} />
            <EmptyHeader className='gap-2'>
                <EmptyTitle className='text-sm font-medium'>{t('title')}</EmptyTitle>
                <EmptyDescription className='text-xs'>{t('description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className='w-fit flex-row flex-wrap items-stretch justify-center gap-px bg-background'>
                <Button variant='cellPrimary' size='cell' asChild>
                    <Link href={newTripHref}>
                        <PlusIcon aria-hidden />
                        {t('newTrip')}
                    </Link>
                </Button>
                <Button variant='cell' size='cell' disabled={isSamplePending} onClick={onCreateSample}>
                    <SparklesIcon aria-hidden />
                    {isSamplePending ? t('creating') : t('template')}
                </Button>
            </EmptyContent>
        </Empty>
    )
}
