import type { ComponentProps } from 'react'
import type { Badge } from '@/shared/ui/badge'

export const TRIP_STATUS_TONES = ['upcoming', 'ongoing', 'done'] as const

export type TripStatusTone = (typeof TRIP_STATUS_TONES)[number]

export type TripStatus = { tone: TripStatusTone; label: string }

export const TRIP_STATUS_BADGE_VARIANT = {
    upcoming: 'outline',
    ongoing: 'default',
    done: 'secondary',
} as const satisfies Record<TripStatusTone, ComponentProps<typeof Badge>['variant']>
