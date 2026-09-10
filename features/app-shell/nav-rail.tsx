'use client'

import { hasNavChildren, isNavItemActive, isNavParentActive } from '@/features/app-shell/nav-active'
import { NavItem, type NavItemLink } from '@/features/app-shell/nav-item'
import { NavSubItem } from '@/features/app-shell/nav-sub-item'
import type { RailFavorite } from '@/features/app-shell/rail-favorite-item'
import { RailFavorites } from '@/features/app-shell/rail-favorites'
import { RailHeader } from '@/features/app-shell/rail-header'
import { UserMenu } from '@/features/app-shell/user-menu'

type NavRailProps<T extends string> = {
    items: NavItemLink<T>[]
    favorites: RailFavorite[]
    activePath: string
    isCollapsed: boolean
    user: { name: string; email: string; username: string | null; image: string | null }
    onToggleCollapsed?: () => void
    onNavigate?: () => void
    onSignOut: () => void
}

export const NavRail = <T extends string>({
    items,
    favorites,
    activePath,
    isCollapsed,
    user,
    onToggleCollapsed,
    onNavigate,
    onSignOut,
}: NavRailProps<T>) => (
    <div className='flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground'>
        <RailHeader isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
        <nav className='flex min-h-0 flex-1 flex-col overflow-y-auto' aria-label='주요 메뉴'>
            <ul className='flex shrink-0 flex-col'>
                {items.map((item) => (
                    <li className='flex flex-col' key={item.label}>
                        <NavItem
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            isActive={isNavParentActive(activePath, item, isCollapsed)}
                            isCollapsed={isCollapsed}
                            onNavigate={onNavigate}
                        />
                        {!isCollapsed && hasNavChildren(item) && (
                            <ul className='ml-7 flex flex-col border-l border-sidebar-border'>
                                {item.children.map((child) => (
                                    <li key={child.href}>
                                        <NavSubItem
                                            href={child.href}
                                            label={child.label}
                                            isActive={isNavItemActive(activePath, child)}
                                            onNavigate={onNavigate}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <RailFavorites favorites={favorites} activePath={activePath} isCollapsed={isCollapsed} onNavigate={onNavigate} />
        </nav>
        <UserMenu name={user.name} email={user.email} username={user.username} image={user.image} isCollapsed={isCollapsed} onSignOut={onSignOut} />
    </div>
)
