'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { INTRO_CTA } from '@/shared/constant/marketing'
import { Button } from '@/shared/ui/button'
import { Reveal } from '@/shared/ui/motion/reveal'

export const IntroCta: FC = () => {
    const t = useTranslations('intro.cta')
    const tActions = useTranslations('common.actions')
    return (
        <section className='mx-auto w-full max-w-7xl px-6 pt-4 pb-20'>
            <Reveal className='flex flex-col items-start gap-4 rounded-md border border-border bg-card p-6 shadow-sm sm:p-8'>
                <h2 className='text-xl font-semibold tracking-tight text-balance'>{t('title')}</h2>
                <p className='text-sm leading-7 text-muted-foreground'>{t('description')}</p>
                <div className='flex w-fit flex-wrap items-stretch gap-px bg-background'>
                    <Button asChild variant='cellPrimary' size='cell'>
                        <Link href={INTRO_CTA.primaryAction.href}>{tActions('start')}</Link>
                    </Button>
                    <Button asChild variant='cell' size='cell'>
                        <Link href={INTRO_CTA.secondaryAction.href}>{tActions('login')}</Link>
                    </Button>
                </div>
                <p className='text-2xs text-muted-foreground'>{t('note')}</p>
            </Reveal>
        </section>
    )
}
