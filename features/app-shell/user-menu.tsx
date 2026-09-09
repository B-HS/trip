'use client'

import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
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
    const motionPreference = useMotionPreference()

    return (
        <div className='flex items-center justify-between gap-2 px-2 py-1.5 text-sm'>
            <Label className='font-normal' htmlFor={MOTION_PREFERENCE_TOGGLE_ID}>
                모션 줄이기
            </Label>
            <Switch
                id={MOTION_PREFERENCE_TOGGLE_ID}
                checked={motionPreference === 'reduced'}
                onCheckedChange={(isReduced) => setMotionPreference(isReduced ? 'reduced' : 'full')}
            />
        </div>
    )
}

const PROFILE_LABEL = '내 프로필'
const PROFILE_SETTINGS_LABEL = '프로필 설정'

export const UserMenu: FC<UserMenuProps> = ({ name, email, username, image, isCollapsed, onSignOut }) => (
    <div className={cn('flex h-12 shrink-0 items-center px-3', isCollapsed && 'justify-center px-0')}>
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'flex h-9 w-full items-center gap-2 rounded-none px-0 text-left text-sm font-medium text-sidebar-foreground outline-none',
                    'hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring',
                    isCollapsed && 'justify-center',
                )}
                aria-label='계정 메뉴 열기'>
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
                    <span>테마</span>
                    <ThemeToggle variant='outline' />
                </div>
                <MotionPreferenceToggle />
                <DropdownMenuSeparator />
                {username !== null && (
                    <DropdownMenuItem asChild>
                        <Link href={`/u/${username}`}>
                            <UserIcon />
                            {PROFILE_LABEL}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href={PROFILE_SETTINGS_PATH}>
                        <SettingsIcon />
                        {PROFILE_SETTINGS_LABEL}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onSignOut}>
                    <LogOutIcon />
                    로그아웃
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
)
