'use client'

import type { FC } from 'react'
import { INTRO_STEPS, INTRO_STEPS_SECTION } from '@/shared/constant/marketing'
import { StaggerItem, StaggerList } from '@/shared/ui/motion/stagger-list'
import { IntroSectionHeading } from '@/features/intro/intro-section-heading'

const FIRST_STEP_NUMBER = 1
const STEP_NUMBER_PAD = 2

export const IntroHowItWorks: FC = () => (
    <section className='mx-auto w-full max-w-3xl px-6 py-16'>
        <IntroSectionHeading {...INTRO_STEPS_SECTION} />
        <StaggerList as='ol' className='mt-10 flex flex-col gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm'>
            {INTRO_STEPS.map((step, index) => (
                <StaggerItem key={step.id} as='li' className='flex items-start gap-4 bg-card p-5'>
                    <span className='flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted text-2xs font-medium text-muted-foreground tabular-nums'>
                        {String(index + FIRST_STEP_NUMBER).padStart(STEP_NUMBER_PAD, '0')}
                    </span>
                    <div className='flex flex-col gap-2'>
                        <h3 className='text-sm font-medium'>{step.title}</h3>
                        <p className='text-sm leading-7 text-muted-foreground'>{step.description}</p>
                    </div>
                </StaggerItem>
            ))}
        </StaggerList>
    </section>
)
