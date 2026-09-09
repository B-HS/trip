'use client'

import type { FC } from 'react'
import { INTRO_FEATURES, INTRO_FEATURES_SECTION } from '@/shared/constant/marketing'
import { MOTION_STAGGER } from '@/shared/lib/motion'
import { Reveal } from '@/shared/ui/motion/reveal'
import { IntroSectionHeading } from '@/features/intro/intro-section-heading'

export const IntroFeatures: FC = () => (
    <section className='mx-auto w-full max-w-5xl px-6 py-16'>
        <IntroSectionHeading {...INTRO_FEATURES_SECTION} />
        <ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {INTRO_FEATURES.map((feature, index) => (
                <Reveal
                    key={feature.id}
                    as='li'
                    delay={index * MOTION_STAGGER}
                    className='flex h-full flex-col gap-3 rounded-md border border-border bg-card p-5 shadow-sm'>
                    <feature.icon aria-hidden className='size-5 text-muted-foreground' />
                    <h3 className='text-sm font-medium'>{feature.title}</h3>
                    <p className='text-sm leading-7 text-muted-foreground'>{feature.description}</p>
                </Reveal>
            ))}
        </ul>
    </section>
)
