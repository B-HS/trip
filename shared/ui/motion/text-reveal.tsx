'use client'

import { motion, type Variants } from 'motion/react'
import { type FC, Fragment } from 'react'
import { MOTION_EASE_STANDARD, MOTION_HERO_DURATION, MOTION_STAGGER } from '@/shared/lib/motion'

const TEXT_REVEAL_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p } as const

const HIDDEN = 'hidden'
const VISIBLE = 'visible'
const WORD_SEPARATOR = ' '
const NO_DELAY = 0

const WORD_VARIANTS: Variants = {
    [HIDDEN]: { opacity: 0, y: '0.35em' },
    [VISIBLE]: { opacity: 1, y: '0em', transition: { duration: MOTION_HERO_DURATION, ease: MOTION_EASE_STANDARD } },
}

export type TextRevealProps = {
    text: string
    as?: keyof typeof TEXT_REVEAL_TAGS
    delay?: number
    stagger?: number
    className?: string
}

export const TextReveal: FC<TextRevealProps> = ({ text, as = 'h1', delay = NO_DELAY, stagger = MOTION_STAGGER, className }) => {
    const Component = TEXT_REVEAL_TAGS[as]
    const words = text.split(WORD_SEPARATOR)
    const containerVariants: Variants = { [HIDDEN]: {}, [VISIBLE]: { transition: { staggerChildren: stagger, delayChildren: delay } } }

    return (
        <Component className={className} aria-label={text}>
            <motion.span aria-hidden variants={containerVariants} initial={HIDDEN} animate={VISIBLE}>
                {words.map((word, index) => (
                    <Fragment key={`${index}-${word}`}>
                        <motion.span className='inline-block' variants={WORD_VARIANTS}>
                            {word}
                        </motion.span>
                        {index < words.length - 1 && WORD_SEPARATOR}
                    </Fragment>
                ))}
            </motion.span>
        </Component>
    )
}
