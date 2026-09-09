'use client'

import type { FC } from 'react'
import { cn } from '@/shared/lib/utils'
import { Reveal } from '@/shared/ui/motion/reveal'

export type IntroSectionHeadingProps = {
    eyebrow: string
    title: string
    description: string
    className?: string
}

export const IntroSectionHeading: FC<IntroSectionHeadingProps> = ({ eyebrow, title, description, className }) => (
    <Reveal className={cn('flex flex-col gap-3', className)}>
        <span className='text-2xs font-medium tracking-wide text-muted-foreground'>{eyebrow}</span>
        <h2 className='text-xl font-semibold tracking-tight text-balance'>{title}</h2>
        <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>{description}</p>
    </Reveal>
)
