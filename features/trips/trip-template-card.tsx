'use client'

import { SparklesIcon } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'

type TripTemplateCardProps = {
    title: string
    description: string
    highlights: string[]
    isPending: boolean
    onCreate: () => void
}

export const TripTemplateCard: FC<TripTemplateCardProps> = ({ title, description, highlights, isPending, onCreate }) => (
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
        <div className='mt-auto flex justify-end'>
            <Button variant='outline' size='sm' disabled={isPending} onClick={onCreate}>
                <SparklesIcon aria-hidden />
                {isPending ? '만드는 중…' : '예시로 시작하기'}
            </Button>
        </div>
    </div>
)
