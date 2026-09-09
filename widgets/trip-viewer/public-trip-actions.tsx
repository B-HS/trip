import type { FC } from 'react'
import type { PublicTrip } from '@/entities/trip/trip.type'
import { AuthorChip } from '@/features/community/author-chip'
import { TripLikeButton } from '@/widgets/trip-viewer/trip-like-button'

export type PublicTripActionsProps = {
    trip: Pick<PublicTrip, 'id' | 'owner'>
    slug: string
    isSignedIn: boolean
}

export const PublicTripActions: FC<PublicTripActionsProps> = ({ trip, slug, isSignedIn }) => (
    <div className='flex flex-wrap items-stretch gap-px bg-background'>
        <div className='flex min-h-10 min-w-0 items-center bg-card px-4 text-xs text-muted-foreground'>
            <AuthorChip author={trip.owner} />
        </div>
        <TripLikeButton tripId={trip.id} slug={slug} isSignedIn={isSignedIn} />
        <div aria-hidden className='min-w-0 flex-1 bg-card' />
    </div>
)
