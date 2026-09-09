'use client'

import { motion, type Variants } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION, MOTION_STAGGER } from '@/shared/lib/motion'

const STAGGER_LIST_TAGS = { div: motion.div, ul: motion.ul, ol: motion.ol } as const
const STAGGER_ITEM_TAGS = { div: motion.div, li: motion.li } as const

const HIDDEN = 'hidden'
const VISIBLE = 'visible'
const ITEM_OFFSET_Y = 8
const NO_DELAY = 0
const STAGGER_MARGIN = '0px 0px -96px 0px'

const ITEM_VARIANTS: Variants = {
    [HIDDEN]: { opacity: 0, y: ITEM_OFFSET_Y },
    [VISIBLE]: { opacity: 1, y: 0, transition: { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD } },
}

export type StaggerListProps = PropsWithChildren<{
    as?: keyof typeof STAGGER_LIST_TAGS
    stagger?: number
    delay?: number
    margin?: string
    className?: string
}>

export const StaggerList: FC<StaggerListProps> = ({
    as = 'div',
    stagger = MOTION_STAGGER,
    delay = NO_DELAY,
    margin = STAGGER_MARGIN,
    className,
    children,
}) => {
    const Component = STAGGER_LIST_TAGS[as]
    const containerVariants: Variants = { [HIDDEN]: {}, [VISIBLE]: { transition: { staggerChildren: stagger, delayChildren: delay } } }

    return (
        <Component className={className} variants={containerVariants} initial={HIDDEN} whileInView={VISIBLE} viewport={{ once: true, margin }}>
            {children}
        </Component>
    )
}

export type StaggerItemProps = PropsWithChildren<{
    as?: keyof typeof STAGGER_ITEM_TAGS
    className?: string
}>

export const StaggerItem: FC<StaggerItemProps> = ({ as = 'div', className, children }) => {
    const Component = STAGGER_ITEM_TAGS[as]

    return (
        <Component className={className} variants={ITEM_VARIANTS}>
            {children}
        </Component>
    )
}
