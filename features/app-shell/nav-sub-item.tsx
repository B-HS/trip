'use client'

import { motion } from 'motion/react'
import { Link } from '@/i18n/navigation'
import { NAV_ACTIVE_LAYOUT_ID, type NavChildLink } from '@/features/app-shell/nav-item'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

const NAV_SUB_ITEM_HEIGHT = 'h-8'

type NavSubItemProps<T extends string> = Omit<NavChildLink<T>, 'matchPrefix'> & {
    isActive: boolean
    onNavigate?: () => void
}

export const NavSubItem = <T extends string>({ href, label, isActive, onNavigate }: NavSubItemProps<T>) => (
    <Link
        className={cn(
            'relative flex w-full shrink-0 items-center rounded-none px-3 text-sm text-sidebar-foreground outline-none',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring',
            NAV_SUB_ITEM_HEIGHT,
            isActive && 'text-sidebar-accent-foreground',
        )}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}>
        {isActive && (
            <motion.span
                className='absolute inset-0 bg-sidebar-accent'
                layoutId={NAV_ACTIVE_LAYOUT_ID}
                transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}
            />
        )}
        <span className='relative truncate'>{label}</span>
    </Link>
)
