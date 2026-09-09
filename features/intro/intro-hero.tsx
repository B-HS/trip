'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import { type FC, useRef } from 'react'
import { INTRO_HERO } from '@/shared/constant/marketing'
import { Button } from '@/shared/ui/button'
import { FadeIn } from '@/shared/ui/motion/fade-in'
import { TextReveal } from '@/shared/ui/motion/text-reveal'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'
import { useReducedMotionPreference } from '@/shared/hooks/use-motion-preference'

const SCROLL_RANGE = [0, 1]
const GLOBE_PARALLAX_DISTANCE = 56
const NO_PARALLAX = 0
const DESCRIPTION_DELAY = 0.22
const ACTIONS_DELAY = 0.32
const NOTE_DELAY = 0.42

export const IntroHero: FC = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const prefersReducedMotion = useReducedMotionPreference()
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
    const globeOffsetY = useTransform(scrollYProgress, SCROLL_RANGE, [NO_PARALLAX, prefersReducedMotion ? NO_PARALLAX : GLOBE_PARALLAX_DISTANCE])

    return (
        <section ref={sectionRef} className='mx-auto w-full max-w-5xl px-6 pt-12 pb-16 sm:pt-16 sm:pb-20'>
            <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-12'>
                <div className='flex flex-col gap-5'>
                    <FadeIn as='span' className='text-2xs font-medium tracking-wide text-muted-foreground'>
                        {INTRO_HERO.eyebrow}
                    </FadeIn>
                    <TextReveal as='h1' text={INTRO_HERO.title} className='text-3xl font-extrabold tracking-tight text-balance' />
                    <FadeIn as='p' delay={DESCRIPTION_DELAY} className='max-w-prose text-sm leading-7 text-muted-foreground'>
                        {INTRO_HERO.description}
                    </FadeIn>
                    <FadeIn delay={ACTIONS_DELAY} className='flex flex-wrap gap-2 pt-1'>
                        <Button asChild size='lg'>
                            <Link href={INTRO_HERO.primaryAction.href}>{INTRO_HERO.primaryAction.label}</Link>
                        </Button>
                        <Button asChild size='lg' variant='outline'>
                            <Link href={INTRO_HERO.secondaryAction.href}>{INTRO_HERO.secondaryAction.label}</Link>
                        </Button>
                    </FadeIn>
                </div>
                <motion.div style={{ y: globeOffsetY }} className='flex flex-col items-center gap-3'>
                    <TripGlobeLazy routes={INTRO_HERO.globeRoutes} variant='hero' />
                    <FadeIn as='p' delay={NOTE_DELAY} className='text-2xs text-muted-foreground'>
                        {INTRO_HERO.globeNote}
                    </FadeIn>
                </motion.div>
            </div>
        </section>
    )
}
