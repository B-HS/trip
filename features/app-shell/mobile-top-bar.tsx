'use client'

import { MenuIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { SITE_NAME } from '@/shared/constant/site'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

type MobileTopBarProps = {
    onOpenNav: () => void
}

export const MobileTopBar: FC<MobileTopBarProps> = ({ onOpenNav }) => {
    const t = useTranslations('common')

    return (
        <div className='flex h-12 shrink-0 items-center justify-between gap-2 bg-sidebar px-3 text-sidebar-foreground'>
            <div className='flex items-center gap-2'>
                <Button
                    className='size-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    variant='ghost'
                    size='icon-sm'
                    aria-label={t('nav.openNav')}
                    onClick={onOpenNav}>
                    <MenuIcon />
                </Button>
                <span className='truncate text-sm font-semibold tracking-tight'>{SITE_NAME}</span>
            </div>
            <ThemeToggle className='text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground' />
        </div>
    )
}
