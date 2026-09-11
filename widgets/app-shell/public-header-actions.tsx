'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import type { FC } from 'react'
import { isNavItemActive, type NavActiveTarget } from '@/features/app-shell/nav-active'
import { DEFAULT_BOARDS } from '@/shared/constant/community'
import { BOARDS_PATH, EXPLORE_PATH, HOME_PATH, LOGIN_PATH, SIGNUP_PATH } from '@/shared/constant/route'
import { useSession } from '@/shared/lib/auth-client'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { LocaleSwitcher } from '@/widgets/app-shell/locale-switcher'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

const BOARD_MENU_CONTENT_CLASS = 'flex min-w-36 flex-col gap-px rounded-none bg-background p-px shadow-none ring-0'
const BOARD_MENU_ITEM_CLASS =
    'rounded-none bg-card px-4 py-2.5 text-xs font-medium focus:bg-muted focus:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground'

type BoardMenuHref = typeof BOARDS_PATH | `${typeof BOARDS_PATH}/${(typeof DEFAULT_BOARDS)[number]['key']}`

type BoardMenuItem = NavActiveTarget<BoardMenuHref> & { label: string }

export const PublicHeaderActions: FC = () => {
    const t = useTranslations('common')
    const tBoards = useTranslations('community.boards')
    const pathname = usePathname()
    const { data: session, isPending } = useSession()

    const boardMenuItems: BoardMenuItem[] = [
        { href: BOARDS_PATH, label: t('nav.boardsAll') },
        ...DEFAULT_BOARDS.map((board) => ({ href: `${BOARDS_PATH}/${board.key}` as const, label: tBoards(`${board.key}.name`), matchPrefix: true })),
    ]

    return (
        <>
            <ThemeToggle />
            <LocaleSwitcher />
            <div className='flex items-stretch gap-px bg-background'>
                <Button variant='cell' size='cell' asChild>
                    <Link href={EXPLORE_PATH}>{t('nav.explore')}</Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='cell' size='cell'>
                            {t('nav.boards')}
                            <ChevronDownIcon aria-hidden />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={BOARD_MENU_CONTENT_CLASS}>
                        {boardMenuItems.map((item) => (
                            <DropdownMenuItem className={BOARD_MENU_ITEM_CLASS} key={item.href} asChild>
                                <Link href={item.href} aria-current={isNavItemActive(pathname, item) ? 'page' : undefined}>
                                    {item.label}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {!isPending &&
                    (session ? (
                        <Button variant='cell' size='cell' asChild>
                            <Link href={HOME_PATH}>{t('actions.home')}</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant='cell' size='cell' asChild>
                                <Link href={LOGIN_PATH}>{t('actions.login')}</Link>
                            </Button>
                            <Button variant='cellPrimary' size='cell' asChild>
                                <Link href={SIGNUP_PATH}>{t('actions.start')}</Link>
                            </Button>
                        </>
                    ))}
            </div>
        </>
    )
}
