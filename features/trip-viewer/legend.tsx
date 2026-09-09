import type { FC } from 'react'
import { SCHEDULE_KIND_LEGEND_LABEL, SCHEDULE_KIND_SWATCH_CLASS } from '@/features/trip-viewer/trip-viewer-kind'
import { SCHEDULE_KINDS } from '@/shared/constant/trip'
import { cn } from '@/shared/lib/utils'

export const TripLegend: FC = () => (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 bg-card px-3 py-2 text-xs text-muted-foreground'>
        {SCHEDULE_KINDS.map((kind) => (
            <span key={kind} className='inline-flex items-center gap-1.5'>
                <span aria-hidden className={cn('size-2 shrink-0', SCHEDULE_KIND_SWATCH_CLASS[kind])} />
                {SCHEDULE_KIND_LEGEND_LABEL[kind]}
            </span>
        ))}
    </div>
)
