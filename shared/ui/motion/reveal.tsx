'use client'

import { motion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_HERO_DURATION } from '@/shared/lib/motion'

const REVEAL_TAGS = { div: motion.div, section: motion.section, li: motion.li, article: motion.article } as const

const REVEAL_MARGIN = '0px 0px -96px 0px'
const REVEAL_OFFSET_Y = 16
const NO_DELAY = 0

export type RevealProps = PropsWithChildren<{
    as?: keyof typeof REVEAL_TAGS
    delay?: number
    offsetY?: number
    duration?: number
    margin?: string
    className?: string
}>

export const Reveal: FC<RevealProps> = ({
    as = 'div',
    delay = NO_DELAY,
    offsetY = REVEAL_OFFSET_Y,
    duration = MOTION_HERO_DURATION,
    margin = REVEAL_MARGIN,
    className,
    children,
}) => {
    const Component = REVEAL_TAGS[as]

    return (
        <Component
            className={className}
            initial={{ opacity: 0, y: offsetY }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin }}
            transition={{ duration, delay, ease: MOTION_EASE_STANDARD }}>
            {children}
        </Component>
    )
}
