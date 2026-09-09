'use client'

import Link from 'next/link'
import type { FC } from 'react'
import { INTRO_CTA } from '@/shared/constant/marketing'
import { Button } from '@/shared/ui/button'
import { Reveal } from '@/shared/ui/motion/reveal'

export const IntroCta: FC = () => (
    <section className='mx-auto w-full max-w-3xl px-6 pt-4 pb-20'>
        <Reveal className='flex flex-col items-start gap-4 rounded-md border border-border bg-card p-6 shadow-sm sm:p-8'>
            <h2 className='text-xl font-semibold tracking-tight text-balance'>{INTRO_CTA.title}</h2>
            <p className='text-sm leading-7 text-muted-foreground'>{INTRO_CTA.description}</p>
            <div className='flex flex-wrap gap-2 pt-1'>
                <Button asChild size='lg'>
                    <Link href={INTRO_CTA.primaryAction.href}>{INTRO_CTA.primaryAction.label}</Link>
                </Button>
                <Button asChild size='lg' variant='outline'>
                    <Link href={INTRO_CTA.secondaryAction.href}>{INTRO_CTA.secondaryAction.label}</Link>
                </Button>
            </div>
            <p className='text-2xs text-muted-foreground'>{INTRO_CTA.note}</p>
        </Reveal>
    </section>
)
