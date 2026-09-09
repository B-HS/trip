import type { TripScheduleKind } from '@/entities/trip/trip.type'
import type { ScheduleKindColorToken } from '@/shared/constant/trip'

export const SCHEDULE_KIND_BADGE_CLASS = {
    'muted': 'bg-muted text-foreground',
    'success': 'bg-success/15 text-foreground',
    'warning': 'bg-warning/15 text-foreground',
    'destructive': 'bg-destructive/15 text-foreground',
    'chart-1': 'bg-chart-1/15 text-foreground',
    'chart-2': 'bg-chart-2/15 text-foreground',
    'chart-3': 'bg-chart-3/15 text-foreground',
    'chart-4': 'bg-chart-4/15 text-foreground',
    'chart-5': 'bg-chart-5/15 text-foreground',
} as const satisfies Record<ScheduleKindColorToken, string>

export const SCHEDULE_KIND_SWATCH_CLASS = {
    'muted': 'bg-muted-foreground',
    'success': 'bg-success',
    'warning': 'bg-warning',
    'destructive': 'bg-destructive',
    'chart-1': 'bg-chart-1',
    'chart-2': 'bg-chart-2',
    'chart-3': 'bg-chart-3',
    'chart-4': 'bg-chart-4',
    'chart-5': 'bg-chart-5',
} as const satisfies Record<ScheduleKindColorToken, string>

export const toScheduleKindMap = (kinds: readonly TripScheduleKind[]) => new Map(kinds.map((kind) => [kind.id, kind]))
