'use client'

import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export type RailFavorite = { id: string; title: string; code: string | null }

type RailFavoriteItemProps = RailFavorite & {
    isActive: boolean
    isCollapsed: boolean
    onNavigate?: () => void
}

export const RailFavoriteItem: FC<RailFavoriteItemProps> = ({ id, title, code, isActive, isCollapsed, onNavigate }) => {
    const link = (
        <Link
            className={cn(
                'flex h-9 w-full shrink-0 items-center gap-3 rounded-none px-3 text-sm font-normal text-sidebar-foreground outline-none',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring',
                isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                isCollapsed && 'justify-center px-0',
            )}
            href={`/trips/${id}`}
            aria-label={title}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}>
            {code === null ? (
                <StarIcon className='size-4 shrink-0' aria-hidden />
            ) : (
                <span className='w-4 shrink-0 text-center font-mono text-2xs tracking-widest' aria-hidden>
                    {code}
                </span>
            )}
            {!isCollapsed && <span className='truncate'>{title}</span>}
        </Link>
    )

    if (!isCollapsed) return link

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side='right'>{title}</TooltipContent>
        </Tooltip>
    )
}
