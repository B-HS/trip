'use client'

import { CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { PublicTrip } from '@/entities/trip/trip.type'
import { AuthorChip } from '@/features/community/author-chip'
import { trackEvent } from '@/shared/lib/analytics'
import { Button } from '@/shared/ui/button'
import { toast } from 'sonner'
import { TripLikeButton } from '@/widgets/trip-viewer/trip-like-button'

export type PublicTripActionsProps = {
    trip: Pick<PublicTrip, 'id' | 'owner'>
    slug: string
    isSignedIn: boolean
}

export const PublicTripActions: FC<PublicTripActionsProps> = ({ trip, slug, isSignedIn }) => (
    <PublicTripActionsInner trip={trip} slug={slug} isSignedIn={isSignedIn} />
)

const PublicTripActionsInner: FC<PublicTripActionsProps> = ({ trip, slug, isSignedIn }) => {
    const t = useTranslations('tripEditor.share')
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            trackEvent('share_link_copied')
            toast.success(t('copySuccess'))
        } catch {
            toast.error(t('copyFailed'))
        }
    }

    return (
        <div className='flex flex-wrap items-stretch gap-px bg-background'>
            <div className='flex min-h-10 min-w-0 items-center bg-card px-4 text-xs text-muted-foreground'>
                <AuthorChip author={trip.owner} />
            </div>
            <TripLikeButton tripId={trip.id} slug={slug} isSignedIn={isSignedIn} />
            <Button type='button' variant='cell' size='cell' onClick={handleCopy}>
                <CopyIcon aria-hidden />
                {t('copyLink')}
            </Button>
            <div aria-hidden className='min-w-0 flex-1 bg-card' />
        </div>
    )
}
