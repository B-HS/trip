'use client'

import { ExternalLinkIcon } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import type { FC } from 'react'
import type { TripScheduleItem } from '@/entities/trip/trip.type'
import { SCHEDULE_KIND_BADGE_CLASS } from '@/features/trip-viewer/trip-viewer-kind'
import { SCHEDULE_BUFFER_LABEL, SCHEDULE_KIND_LABEL, buildMapUrl } from '@/shared/constant/trip'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'

const ROW_OFFSET_Y = 8
const COMPLETED_OPACITY = 0.55
const FULL_OPACITY = 1

const ROW_TRANSITION = { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD } as const

const ROW_VARIANTS: Variants = {
    hidden: { opacity: 0, y: ROW_OFFSET_Y },
    visible: { opacity: 1, y: 0, transition: ROW_TRANSITION },
    exit: { opacity: 0, y: -ROW_OFFSET_Y, transition: ROW_TRANSITION },
}

type ScheduleRowProps = {
    item: TripScheduleItem
    isCompleted: boolean
    isCheckable: boolean
    onToggle?: (checked: boolean) => void
}

export const ScheduleRow: FC<ScheduleRowProps> = ({ item, isCompleted, isCheckable, onToggle }) => {
    const checkboxId = `schedule-check-${item.id}`
    const bufferLabel = item.bufferNote ?? SCHEDULE_BUFFER_LABEL[item.kind]
    const content = (
        <>
            <span className='flex flex-wrap items-baseline justify-between gap-2'>
                <strong className='text-sm leading-snug font-medium break-keep'>{item.title}</strong>
                <Badge variant='outline' className={cn('h-auto shrink-0 px-2 py-0.5 text-2xs', SCHEDULE_KIND_BADGE_CLASS[item.kind])}>
                    {SCHEDULE_KIND_LABEL[item.kind]}
                </Badge>
            </span>
            {item.note && <span className='mt-1 block text-xs break-keep text-muted-foreground'>{item.note}</span>}
            <span className='mt-1 inline-block bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground'>{bufferLabel}</span>
        </>
    )

    return (
        <motion.li layout variants={ROW_VARIANTS} exit='exit' className='list-none'>
            <motion.div
                className='grid grid-cols-1 gap-px sm:grid-cols-[7rem_minmax(0,1fr)]'
                animate={{ opacity: isCompleted ? COMPLETED_OPACITY : FULL_OPACITY }}
                transition={ROW_TRANSITION}>
                <time className={cn('bg-muted p-3 font-mono text-xs font-medium tabular-nums', isCompleted && 'line-through')}>{item.timeLabel}</time>
                <div className='flex items-start gap-3 bg-card p-3'>
                    {isCheckable && (
                        <Checkbox
                            id={checkboxId}
                            className='mt-0.5 rounded-none'
                            checked={isCompleted}
                            aria-label={`${item.timeLabel} ${item.title} 완료`}
                            onCheckedChange={(checked) => onToggle?.(checked === true)}
                        />
                    )}
                    {isCheckable ? (
                        <label htmlFor={checkboxId} className={cn('min-w-0 flex-1 cursor-pointer', isCompleted && 'line-through')}>
                            {content}
                        </label>
                    ) : (
                        <div className={cn('min-w-0 flex-1', isCompleted && 'line-through')}>{content}</div>
                    )}
                    {item.mapQuery && (
                        <a
                            className='inline-flex h-7 shrink-0 items-center gap-1 rounded-none bg-primary px-2 text-2xs font-medium text-primary-foreground no-underline'
                            href={buildMapUrl(item.mapQuery)}
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label={`${item.title} Google 지도에서 열기`}>
                            지도 열기
                            <ExternalLinkIcon aria-hidden className='size-3' />
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.li>
    )
}
