'use client'

import { PlusIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
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

export const TripEmptyState: FC<TripEmptyStateProps> = ({ newTripHref, isSamplePending, onCreateSample }) => (
    <Empty className='gap-6 rounded-none border-none bg-card p-3'>
        <TripGlobeLazy className='max-w-md' routes={SAMPLE_ROUTES} variant='panel' interactive={false} />
        <EmptyHeader className='gap-2'>
            <EmptyTitle className='text-sm font-medium'>아직 트립이 없습니다</EmptyTitle>
            <EmptyDescription className='text-xs'>새 트립을 만들거나 오사카 예시 트립으로 구조를 먼저 살펴보세요.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className='w-fit flex-row flex-wrap items-stretch justify-center gap-px bg-background'>
            <Button variant='cellPrimary' size='cell' asChild>
                <Link href={newTripHref}>
                    <PlusIcon aria-hidden />새 트립
                </Link>
            </Button>
            <Button variant='cell' size='cell' disabled={isSamplePending} onClick={onCreateSample}>
                <SparklesIcon aria-hidden />
                {isSamplePending ? '만드는 중…' : '오사카 예시 트립 만들기'}
            </Button>
        </EmptyContent>
    </Empty>
)
