'use client'

import { CompassIcon, HomeIcon, ListIcon, MessagesSquareIcon, PlusIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useEffect, useState, type FC, type PropsWithChildren } from 'react'
import { useFavoriteTrips } from '@/entities/trip/trip.query'
import { MobileTopBar } from '@/features/app-shell/mobile-top-bar'
import type { NavItemLink } from '@/features/app-shell/nav-item'
import { NavRail } from '@/features/app-shell/nav-rail'
import type { RailFavorite } from '@/features/app-shell/rail-favorite-item'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { DEFAULT_BOARDS } from '@/shared/constant/community'
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

type BoardNavHref = `${typeof BOARDS_PATH}/${(typeof DEFAULT_BOARDS)[number]['key']}`

const buildNavItems = (
    t: ReturnType<typeof useTranslations<'common'>>,
    tKinds: ReturnType<typeof useTranslations<'community.boardKind'>>,
): NavItemLink<BoardNavHref>[] => [
    { href: HOME_PATH, label: t('nav.home'), icon: HomeIcon },
    { href: EXPLORE_PATH, label: t('nav.explore'), icon: CompassIcon, matchPrefix: true },
    {
        href: BOARDS_PATH,
        label: t('nav.boards'),
        icon: MessagesSquareIcon,
        matchPrefix: true,
        children: DEFAULT_BOARDS.map((board) => ({ href: `${BOARDS_PATH}/${board.key}`, label: tKinds(board.kind), matchPrefix: true })),
    },
    { href: TRIPS_PATH, label: t('nav.trips'), icon: ListIcon },
    { href: NEW_TRIP_PATH, label: t('nav.newTrip'), icon: PlusIcon },
]

const writeSidebarState = (isCollapsed: boolean) => {
    const state = isCollapsed ? SIDEBAR_STATE_COLLAPSED : SIDEBAR_STATE_EXPANDED
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export const AppShell: FC<AppShellProps> = ({ user, defaultCollapsed = false, children }) => {
    const t = useTranslations('common')
    const tKinds = useTranslations('community.boardKind')
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isNavOpen, setIsNavOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const favoriteTrips = useFavoriteTrips()
    const navItems = buildNavItems(t, tKinds)

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
                            <SheetTitle className='sr-only'>{t('nav.navigationMenu')}</SheetTitle>
                            <SheetDescription className='sr-only'>{t('nav.navigationMenuDescription')}</SheetDescription>
                            <NavRail
                                items={navItems}
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
                        items={navItems}
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
