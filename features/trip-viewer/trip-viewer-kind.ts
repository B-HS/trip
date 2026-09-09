import type { ScheduleKind } from '@/shared/constant/trip'

export const SCHEDULE_KIND_BADGE_CLASS = {
    planned: 'bg-muted text-foreground',
    confirmed: 'bg-success/15 text-foreground',
    target: 'bg-warning/15 text-foreground',
} as const satisfies Record<ScheduleKind, string>

export const SCHEDULE_KIND_SWATCH_CLASS = {
    planned: 'bg-muted-foreground',
    confirmed: 'bg-success',
    target: 'bg-warning',
} as const satisfies Record<ScheduleKind, string>

export const SCHEDULE_KIND_LEGEND_LABEL = {
    planned: '계획 일정',
    confirmed: '항공편·공식 셔틀',
    target: '예매 목표·미확정',
} as const satisfies Record<ScheduleKind, string>
