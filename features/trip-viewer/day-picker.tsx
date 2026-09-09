'use client'

import { type FC, useEffect, useRef } from 'react'
import type { TripDayDetail } from '@/entities/trip/trip.type'
import { formatMonthDay, formatRatio } from '@/features/trip-viewer/trip-viewer-format'
import { cn } from '@/shared/lib/utils'

export type DayPickerItem = Pick<TripDayDetail, 'id' | 'date' | 'shortLabel'> & {
    completedCount: number
    totalCount: number
}

type DayPickerProps = {
    days: readonly DayPickerItem[]
    activeDayIndex: number
    panelId: string
    onSelect: (dayIndex: number) => void
}

export const DayPicker: FC<DayPickerProps> = ({ days, activeDayIndex, panelId, onSelect }) => {
    const activeButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        activeButtonRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
    }, [activeDayIndex])

    return (
        <nav className='flex gap-px overflow-x-auto bg-background' aria-label='여행 날짜'>
            {days.map((day, dayIndex) => (
                <button
                    key={day.id}
                    ref={dayIndex === activeDayIndex ? activeButtonRef : null}
                    type='button'
                    aria-pressed={dayIndex === activeDayIndex}
                    aria-controls={panelId}
                    onClick={() => onSelect(dayIndex)}
                    className={cn(
                        'flex min-h-16 min-w-20 flex-1 shrink-0 flex-col justify-center gap-0.5 rounded-none px-2 py-2 text-left outline-none',
                        'focus-visible:ring-3 focus-visible:ring-ring/50',
                        dayIndex === activeDayIndex ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted',
                    )}>
                    <strong className='block font-mono text-xs font-medium tabular-nums'>{formatMonthDay(day.date)}</strong>
                    <span className='block truncate text-xs'>{day.shortLabel}</span>
                    <small
                        className={cn(
                            'block font-mono text-2xs tabular-nums',
                            dayIndex === activeDayIndex ? 'text-primary-foreground' : 'text-muted-foreground',
                        )}>
                        {formatRatio(day.completedCount, day.totalCount)}
                    </small>
                </button>
            ))}
        </nav>
    )
}
