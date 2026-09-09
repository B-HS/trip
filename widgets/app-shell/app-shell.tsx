'use client'

import { CompassIcon, HomeIcon, ListIcon, MessagesSquareIcon, PlusIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type FC, type PropsWithChildren } from 'react'
import { useFavoriteTrips } from '@/entities/trip/trip.query'
import { MobileTopBar } from '@/features/app-shell/mobile-top-bar'
import type { NavItemLink } from '@/features/app-shell/nav-item'
import { NavRail } from '@/features/app-shell/nav-rail'
import type { RailFavorite } from '@/features/app-shell/rail-favorite-item'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { BOARDS_PATH, EXPLORE_PATH, HOME_PATH, LOGIN_PATH, NEW_TRIP_PATH, TRIPS_PATH } from '@/shared/constant/route'
import { signOut } from '@/shared/lib/auth-client'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet'
import {
    SIDEBAR_COLLAPSE_DURATION,
    SIDEBAR_COOKIE_MAX_AGE_SECONDS,
    SIDEBAR_COOKIE_NAME,
    SIDEBAR_STATE_COLLAPSED,
    SIDEBAR_STATE_EXPANDED,
    SIDEBAR_TOGGLE_KEY,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON,
    SIDEBAR_WIDTH_MOBILE,
} from '@/widgets/app-shell/app-shell.constant'

export type AppShellUser = {
    id: string
    name: string
    email: string
    username: string | null
    image: string | null
}

type AppShellProps = PropsWithChildren<{
    user: AppShellUser
    defaultCollapsed?: boolean
}>

const NAV_ITEMS: NavItemLink[] = [
    { href: HOME_PATH, label: '홈', icon: HomeIcon },
    { href: EXPLORE_PATH, label: '탐색', icon: CompassIcon, matchPrefix: true },
    { href: BOARDS_PATH, label: '게시판', icon: MessagesSquareIcon, matchPrefix: true },
    { href: TRIPS_PATH, label: '트립 목록', icon: ListIcon },
    { href: NEW_TRIP_PATH, label: '새 트립', icon: PlusIcon },
]

const writeSidebarState = (isCollapsed: boolean) => {
    const state = isCollapsed ? SIDEBAR_STATE_COLLAPSED : SIDEBAR_STATE_EXPANDED
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export const AppShell: FC<AppShellProps> = ({ user, defaultCollapsed = false, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isNavOpen, setIsNavOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const favoriteTrips = useFavoriteTrips()

    const favorites: RailFavorite[] = (favoriteTrips.data ?? []).map((trip) => ({
        id: trip.id,
        title: trip.title,
        code: trip.destinations[0]?.countryCode ?? null,
    }))

    const handleSignOut = async () => {
        await signOut()
        router.push(LOGIN_PATH)
        router.refresh()
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== SIDEBAR_TOGGLE_KEY) return
            event.preventDefault()
            setIsCollapsed((previous) => !previous)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => writeSidebarState(isCollapsed), [isCollapsed])

    return (
        <div className='flex h-dvh min-h-0 w-full flex-col bg-background md:flex-row print:h-auto print:overflow-visible'>
            {isMobile ? (
                <>
                    <div className='print:hidden'>
                        <MobileTopBar onOpenNav={() => setIsNavOpen(true)} />
                    </div>
                    <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                        <SheetContent
                            className='max-w-none gap-0 border-0 bg-sidebar p-0 text-sidebar-foreground sm:max-w-none'
                            style={{ width: SIDEBAR_WIDTH_MOBILE }}
                            side='left'>
                            <SheetTitle className='sr-only'>탐색 메뉴</SheetTitle>
                            <SheetDescription className='sr-only'>트립의 주요 화면으로 이동합니다.</SheetDescription>
                            <NavRail
                                items={NAV_ITEMS}
                                favorites={favorites}
                                activePath={pathname}
                                isCollapsed={false}
                                user={user}
                                onNavigate={() => setIsNavOpen(false)}
                                onSignOut={handleSignOut}
                            />
                        </SheetContent>
                    </Sheet>
                </>
            ) : (
                <motion.aside
                    className='shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground print:hidden'
                    initial={false}
                    animate={{ width: isCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}
                    transition={{ duration: SIDEBAR_COLLAPSE_DURATION, ease: 'linear' }}>
                    <NavRail
                        items={NAV_ITEMS}
                        favorites={favorites}
                        activePath={pathname}
                        isCollapsed={isCollapsed}
                        user={user}
                        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
                        onSignOut={handleSignOut}
                    />
                </motion.aside>
            )}
            <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-px bg-background'>
                <main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-auto print:overflow-visible'>
                    <div className='flex flex-1 flex-col'>{children}</div>
                </main>
            </div>
        </div>
    )
}
