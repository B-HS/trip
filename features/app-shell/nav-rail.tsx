'use client'

import type { FC } from 'react'
import { NavItem, type NavItemLink } from '@/features/app-shell/nav-item'
import type { RailFavorite } from '@/features/app-shell/rail-favorite-item'
import { RailFavorites } from '@/features/app-shell/rail-favorites'
import { RailHeader } from '@/features/app-shell/rail-header'
import { UserMenu } from '@/features/app-shell/user-menu'

type NavRailProps = {
    items: NavItemLink[]
    favorites: RailFavorite[]
    activePath: string
    isCollapsed: boolean
    user: { name: string; email: string; username: string | null; image: string | null }
    onToggleCollapsed?: () => void
    onNavigate?: () => void
    onSignOut: () => void
}

export const NavRail: FC<NavRailProps> = ({ items, favorites, activePath, isCollapsed, user, onToggleCollapsed, onNavigate, onSignOut }) => (
    <div className='flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground'>
        <RailHeader isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
        <nav className='flex min-h-0 flex-1 flex-col overflow-y-auto' aria-label='주요 메뉴'>
            {items.map((item) => (
                <NavItem
                    key={item.label}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={activePath === item.href}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                />
            ))}
            <RailFavorites favorites={favorites} activePath={activePath} isCollapsed={isCollapsed} onNavigate={onNavigate} />
        </nav>
        <UserMenu name={user.name} email={user.email} username={user.username} image={user.image} isCollapsed={isCollapsed} onSignOut={onSignOut} />
    </div>
)
