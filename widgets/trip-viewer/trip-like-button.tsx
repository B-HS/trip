'use client'

import type { FC } from 'react'
import { useToggleTripLike, useTripLike } from '@/entities/trip/trip.query'
import { LikeCell } from '@/features/community/like-cell'
import { LOGIN_PATH } from '@/shared/constant/route'

export type TripLikeButtonProps = {
    tripId: string
    slug: string
    isSignedIn: boolean
}

const FALLBACK_LIKE_COUNT = 0

export const TripLikeButton: FC<TripLikeButtonProps> = ({ tripId, slug, isSignedIn }) => {
    const tripLike = useTripLike(tripId)
    const toggleTripLike = useToggleTripLike(tripId)

    const count = tripLike.data?.count ?? FALLBACK_LIKE_COUNT
    const liked = tripLike.data?.liked ?? false

    return (
        <LikeCell
            count={count}
            isLiked={liked}
            isPending={toggleTripLike.isPending}
            loginHref={isSignedIn ? null : `${LOGIN_PATH}?next=/s/${slug}`}
            onToggle={() => toggleTripLike.mutate(!liked)}
        />
    )
}
