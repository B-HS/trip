'use client'

import type { FC } from 'react'
import { AnimatedNumber } from '@/shared/ui/motion/animated-number'

export type TripStatTile = { label: string; value: number }

type TripStatTilesProps = {
    tiles: TripStatTile[]
}

export const TripStatTiles: FC<TripStatTilesProps> = ({ tiles }) => (
    <div className='grid grid-cols-2 gap-px bg-background lg:grid-cols-4'>
        {tiles.map((tile) => (
            <article key={tile.label} className='flex h-full flex-col items-start gap-1 bg-card p-3'>
                <p className='text-2xs tracking-wide text-muted-foreground uppercase'>{tile.label}</p>
                <AnimatedNumber className='text-2xl font-semibold tracking-tight' value={tile.value} />
            </article>
        ))}
    </div>
)
