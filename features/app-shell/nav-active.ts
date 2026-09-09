import type { NavItemLink } from '@/features/app-shell/nav-item'

const ROOT_PATH = '/'

export type NavActiveTarget = Pick<NavItemLink, 'href' | 'matchPrefix'>

export const isNavItemActive = (pathname: string, item: NavActiveTarget) => {
    if (item.href === ROOT_PATH) return pathname === ROOT_PATH
    if (item.matchPrefix !== true) return pathname === item.href
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
