'use client'

import { motion } from 'motion/react'
import type { FC } from 'react'
import { MOTION_BAR_DURATION, MOTION_EASE_STANDARD } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

const MIN_PERCENT = 0
const MAX_PERCENT = 100

export type AnimatedProgressProps = {
    value: number
    label: string
    className?: string
}

export const AnimatedProgress: FC<AnimatedProgressProps> = ({ value, label, className }) => {
    const percent = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, value))

    return (
        <div
            role='progressbar'
            aria-label={label}
            aria-valuemin={MIN_PERCENT}
            aria-valuemax={MAX_PERCENT}
            aria-valuenow={Math.round(percent)}
            className={cn('h-1 w-full rounded-none bg-muted', className)}>
            <motion.div
                className='h-full rounded-none bg-foreground'
                initial={{ width: `${MIN_PERCENT}%` }}
                whileInView={{ width: `${percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: MOTION_BAR_DURATION, ease: MOTION_EASE_STANDARD }}
            />
        </div>
    )
}
