import type { FC } from 'react'
import type { TripScheduleKind } from '@/entities/trip/trip.type'
import { SCHEDULE_KIND_SWATCH_CLASS } from '@/features/trip-viewer/trip-viewer-kind'
import { cn } from '@/shared/lib/utils'

type TripLegendProps = {
    kinds: readonly TripScheduleKind[]
}

export const TripLegend: FC<TripLegendProps> = ({ kinds }) => (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 bg-muted px-3 py-2 text-xs text-muted-foreground'>
        {kinds.map((kind) => (
            <span key={kind.id} className='inline-flex items-center gap-1.5'>
                <span aria-hidden className={cn('size-2 shrink-0', SCHEDULE_KIND_SWATCH_CLASS[kind.colorToken])} />
                {kind.legendLabel}
            </span>
        ))}
    </div>
)
