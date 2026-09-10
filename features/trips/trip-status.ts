export const TRIP_STATUS_TONES = ['upcoming', 'ongoing', 'done'] as const

export type TripStatusTone = (typeof TRIP_STATUS_TONES)[number]

export type TripStatus = { tone: TripStatusTone; label: string }

export const TRIP_STATUS_TEXT_CLASS = {
    upcoming: 'text-foreground',
    ongoing: 'text-foreground',
    done: 'text-muted-foreground',
} as const satisfies Record<TripStatusTone, string>
