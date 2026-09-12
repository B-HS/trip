'use client'

import { LanguagesIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'
import type { FC } from 'react'
import { setMotionPreference, useMotionPreference } from '@/shared/hooks/use-motion-preference'
import { PROFILE_SETTINGS_PATH } from '@/shared/constant/route'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

type UserMenuProps = {
    name: string
    email: string
    username: string | null
    image: string | null
    isCollapsed: boolean
    onSignOut: () => void
}

const MOTION_PREFERENCE_TOGGLE_ID = 'user-menu-motion-preference'

const MotionPreferenceToggle: FC = () => {
    const t = useTranslations('common.userMenu')
    const motionPreference = useMotionPreference()

    return (
        <div className='flex items-center justify-between gap-2 px-2 py-1.5 text-sm'>
            <Label className='font-normal' htmlFor={MOTION_PREFERENCE_TOGGLE_ID}>
                {t('reduceMotion')}
            </Label>
            <Switch
                id={MOTION_PREFERENCE_TOGGLE_ID}
                checked={motionPreference === 'reduced'}
                onCheckedChange={(isReduced) => setMotionPreference(isReduced ? 'reduced' : 'full')}
            />
        </div>
    )
}

export const UserMenu: FC<UserMenuProps> = ({ name, email, username, image, isCollapsed, onSignOut }) => {
    const t = useTranslations('common.userMenu')
    const tLocale = useTranslations('common.localeSwitcher')
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()

    const switchLocale = (next: AppLocale) => router.replace(pathname, { locale: next })

    return (
        <div className={cn('flex h-12 shrink-0 items-center px-3', isCollapsed && 'justify-center px-0')}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    className={cn(
                        'flex h-9 w-full items-center gap-2 rounded-none px-0 text-left text-sm font-medium text-sidebar-foreground outline-none',
                        'hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring',
                        isCollapsed && 'justify-center',
                    )}
                    aria-label={t('accountMenu')}>
                    <Avatar size='sm'>
                        {image && <AvatarImage src={image} alt='' />}
                        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && <span className='truncate'>{name}</span>}
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='start' side='top' sideOffset={8}>
                    <DropdownMenuLabel className='flex flex-col gap-0.5'>
                        <span className='truncate font-medium'>{username ?? name}</span>
                        <span className='truncate text-xs font-normal text-muted-foreground'>{email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='flex items-center justify-between gap-2 px-2 py-1.5 text-sm'>
                        <span>{t('theme')}</span>
                        <ThemeToggle variant='outline' />
                    </div>
                    <MotionPreferenceToggle />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <LanguagesIcon />
                            {tLocale('menuAria')}
                            <span className='ml-auto text-xs text-muted-foreground'>{tLocale(`names.${locale}`)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {routing.locales.map((item) => (
                                <DropdownMenuItem key={item} aria-current={item === locale ? 'true' : undefined} onSelect={() => switchLocale(item)}>
                                    {tLocale(`names.${item}`)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    {username !== null && (
                        <DropdownMenuItem asChild>
                            <Link href={`/u/${username}`}>
                                <UserIcon />
                                {t('profile')}
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href={PROFILE_SETTINGS_PATH}>
                            <SettingsIcon />
                            {t('profileSettings')}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onSignOut}>
                        <LogOutIcon />
                        {t('signOut')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
