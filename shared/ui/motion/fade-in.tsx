'use client'

import { motion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'

const FADE_IN_TAGS = {
    div: motion.div,
    section: motion.section,
    span: motion.span,
    p: motion.p,
    li: motion.li,
} as const

const DEFAULT_OFFSET_Y = 8
const NO_DELAY = 0

export type FadeInProps = PropsWithChildren<{
    as?: keyof typeof FADE_IN_TAGS
    delay?: number
    offsetY?: number
    duration?: number
    className?: string
}>

export const FadeIn: FC<FadeInProps> = ({
    as = 'div',
    delay = NO_DELAY,
    offsetY = DEFAULT_OFFSET_Y,
    duration = MOTION_FADE_DURATION,
    className,
    children,
}) => {
    const Component = FADE_IN_TAGS[as]

    return (
        <Component
            className={className}
            initial={{ opacity: 0, y: offsetY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: MOTION_EASE_STANDARD }}>
            {children}
        </Component>
    )
}
