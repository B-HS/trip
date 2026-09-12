'use client'

import { SparklesIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'

type TripTemplateCardProps = {
    title: string
    description: string
    highlights: string[]
    isPending: boolean
    onCreate: () => void
}

export const TripTemplateCard: FC<TripTemplateCardProps> = ({ title, description, highlights, isPending, onCreate }) => {
    const t = useTranslations('trips')
    return (
        <div className='flex h-full flex-col gap-3'>
            <div className='flex flex-col gap-1'>
                <h3 className='text-sm font-medium text-card-foreground'>{title}</h3>
                <p className='text-xs text-muted-foreground'>{description}</p>
            </div>
            <ul className='flex flex-wrap gap-x-2 gap-y-1 font-mono text-2xs text-muted-foreground tabular-nums'>
                {highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                ))}
            </ul>
            <div className='mt-auto flex w-fit gap-px self-end bg-background'>
                <Button variant='cell' size='cell' disabled={isPending} onClick={onCreate}>
                    <SparklesIcon aria-hidden />
                    {isPending ? t('list.creating') : t('create.templateTitle')}
                </Button>
            </div>
        </div>
    )
}
