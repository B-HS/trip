'use client'

import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { Route } from 'next'
import Link from 'next/link'
import type { FC } from 'react'
import { cn } from '@/shared/lib/utils'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'

export const NAV_ACTIVE_LAYOUT_ID = 'app-shell-nav-active'

export type NavChildLink<T extends string = string> = {
    href: Route<T>
    label: string
    matchPrefix?: boolean
}

export type NavItemLink<T extends string = string> = {
    href: Route
    label: string
    icon: LucideIcon
    matchPrefix?: boolean
    children?: NavChildLink<T>[]
}

type NavItemProps = Omit<NavItemLink, 'matchPrefix' | 'children'> & {
    isActive: boolean
    isCollapsed: boolean
    onNavigate?: () => void
}

export const NavItem: FC<NavItemProps> = ({ href, label, icon: Icon, isActive, isCollapsed, onNavigate }) => (
    <Link
        className={cn(
            'relative flex h-9 w-full shrink-0 items-center gap-3 rounded-none px-3 text-sm font-medium text-sidebar-foreground outline-none',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring',
            isActive && 'text-sidebar-accent-foreground',
            isCollapsed && 'justify-center px-0',
        )}
        href={href}
        title={isCollapsed ? label : undefined}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}>
        {isActive && (
            <motion.span
                className='absolute inset-0 bg-sidebar-accent'
                layoutId={NAV_ACTIVE_LAYOUT_ID}
                transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}
            />
        )}
        <Icon className='relative size-4 shrink-0' aria-hidden />
        {!isCollapsed && <span className='relative truncate'>{label}</span>}
    </Link>
)
