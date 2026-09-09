'use client'

import type { FC } from 'react'
import { IntroCta } from '@/features/intro/intro-cta'
import { IntroFeatures } from '@/features/intro/intro-features'
import { IntroHero } from '@/features/intro/intro-hero'
import { IntroHowItWorks } from '@/features/intro/intro-how-it-works'
import { IntroShowcase } from '@/features/intro/intro-showcase'

export const IntroWidget: FC = () => (
    <div className='flex w-full flex-1 flex-col'>
        <IntroHero />
        <IntroFeatures />
        <IntroHowItWorks />
        <IntroShowcase />
        <IntroCta />
    </div>
)
