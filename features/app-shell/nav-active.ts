import type { NavChildLink, NavItemLink } from '@/features/app-shell/nav-item'

const ROOT_PATH = '/'

export type NavActiveTarget<T extends string = string> = Pick<NavChildLink<T>, 'href' | 'matchPrefix'>

export type NavActiveParent<T extends string = string> = NavActiveTarget & Pick<NavItemLink<T>, 'children'>

export const isNavItemActive = <T extends string>(pathname: string, item: NavActiveTarget<T>) => {
    if (item.href === ROOT_PATH) return pathname === ROOT_PATH
    if (item.matchPrefix !== true) return pathname === item.href
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export const hasNavChildren = <T extends string>(
    item: Pick<NavItemLink<T>, 'children'>,
): item is Pick<NavItemLink<T>, 'children'> & { children: NavChildLink<T>[] } => item.children !== undefined && item.children.length > 0

export const isNavParentActive = <T extends string>(pathname: string, item: NavActiveParent<T>, isCollapsed: boolean) => {
    if (!hasNavChildren(item) || isCollapsed) return isNavItemActive(pathname, item)
    if (item.children.some((child) => isNavItemActive(pathname, child))) return false
    return isNavItemActive(pathname, item)
}
