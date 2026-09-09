'use client'

import { Check } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import type { FC } from 'react'
import { cn } from '@/shared/lib/utils'
import { INTRO_SHOWCASE } from '@/shared/constant/marketing'
import { MOTION_BAR_DURATION, MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { AnimatedNumber } from '@/shared/ui/motion/animated-number'
import { AnimatedProgress } from '@/shared/ui/motion/animated-progress'
import { Reveal } from '@/shared/ui/motion/reveal'
import { IntroSectionHeading } from '@/features/intro/intro-section-heading'

const REST = 'rest'
const DONE = 'done'
const SHOWCASE_MARGIN = '0px 0px -96px 0px'
const ROW_STAGGER = 0.1
const ROW_DELAY = 0.15
const CHECK_DELAY = 0.16
const ROW_OFFSET_Y = 6
const CHECK_REST_SCALE = 0.5
const LABEL_DONE_OPACITY = 0.6
const PERCENT_SCALE = 100

const LIST_VARIANTS: Variants = {
    [REST]: {},
    [DONE]: { transition: { staggerChildren: ROW_STAGGER, delayChildren: ROW_DELAY } },
}

const ROW_VARIANTS: Variants = {
    [REST]: { opacity: 0, y: ROW_OFFSET_Y },
    [DONE]: { opacity: 1, y: 0, transition: { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD, delayChildren: CHECK_DELAY } },
}

const CHECK_VARIANTS: Variants = {
    [REST]: { opacity: 0, scale: CHECK_REST_SCALE },
    [DONE]: { opacity: 1, scale: 1, transition: { duration: MOTION_BAR_DURATION, ease: MOTION_EASE_STANDARD } },
}

const STRIKE_VARIANTS: Variants = {
    [REST]: { scaleX: 0 },
    [DONE]: { scaleX: 1, transition: { duration: MOTION_BAR_DURATION, ease: MOTION_EASE_STANDARD } },
}

const LABEL_VARIANTS: Variants = {
    [REST]: { opacity: 1 },
    [DONE]: { opacity: LABEL_DONE_OPACITY, transition: { duration: MOTION_BAR_DURATION, ease: MOTION_EASE_STANDARD } },
}

export const IntroShowcase: FC = () => {
    const totalCount = INTRO_SHOWCASE.items.length
    const completedCount = INTRO_SHOWCASE.items.filter((item) => item.isCompleted).length
    const completedPercent = (completedCount / totalCount) * PERCENT_SCALE

    return (
        <section className='mx-auto w-full max-w-3xl px-6 py-16'>
            <IntroSectionHeading eyebrow={INTRO_SHOWCASE.eyebrow} title={INTRO_SHOWCASE.title} description={INTRO_SHOWCASE.description} />
            <Reveal className='mt-10 flex flex-col gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm'>
                <div className='flex flex-col gap-3 bg-card p-5'>
                    <div className='flex items-baseline justify-between gap-4'>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-2xs font-medium tracking-wide text-muted-foreground'>{INTRO_SHOWCASE.dayLabel}</span>
                            <h3 className='text-sm font-medium'>{INTRO_SHOWCASE.dayTitle}</h3>
                        </div>
                        <p className='shrink-0 text-2xs text-muted-foreground'>
                            <AnimatedNumber value={completedCount} /> / {totalCount} {INTRO_SHOWCASE.completedSuffix}
                        </p>
                    </div>
                    <AnimatedProgress value={completedPercent} label={INTRO_SHOWCASE.progressLabel} />
                </div>
                <motion.ul
                    className='flex flex-col gap-px bg-border'
                    variants={LIST_VARIANTS}
                    initial={REST}
                    whileInView={DONE}
                    viewport={{ once: true, margin: SHOWCASE_MARGIN }}>
                    {INTRO_SHOWCASE.items.map((item) => (
                        <motion.li key={item.id} variants={ROW_VARIANTS} className='flex items-start gap-3 bg-card p-4'>
                            <span
                                className={cn(
                                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-none',
                                    item.isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted',
                                )}>
                                {item.isCompleted && (
                                    <motion.span variants={CHECK_VARIANTS} className='flex'>
                                        <Check aria-hidden className='size-3' />
                                    </motion.span>
                                )}
                            </span>
                            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                                <motion.span variants={item.isCompleted ? LABEL_VARIANTS : undefined} className='relative w-fit text-sm font-medium'>
                                    {item.title}
                                    {item.isCompleted && (
                                        <motion.span
                                            aria-hidden
                                            variants={STRIKE_VARIANTS}
                                            className='absolute inset-x-0 top-1/2 h-px origin-left bg-foreground'
                                        />
                                    )}
                                    {item.isCompleted && <span className='sr-only'> {INTRO_SHOWCASE.completedSuffix}</span>}
                                </motion.span>
                                <span className='text-xs text-muted-foreground'>{item.note}</span>
                            </div>
                            <span className='shrink-0 text-2xs text-muted-foreground tabular-nums'>{item.time}</span>
                        </motion.li>
                    ))}
                </motion.ul>
            </Reveal>
        </section>
    )
}
