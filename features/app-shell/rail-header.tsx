'use client'

import { PanelLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { SITE_NAME } from '@/shared/constant/site'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

type RailHeaderProps = {
    isCollapsed: boolean
    onToggle?: () => void
}

export const RailHeader: FC<RailHeaderProps> = ({ isCollapsed, onToggle }) => {
    const t = useTranslations('common')
    const toggleLabel = isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')

    return (
        <div className={cn('flex h-12 shrink-0 items-center gap-2 px-3', isCollapsed && 'justify-center px-0')}>
            {onToggle && (
                <Button
                    className='size-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    variant='ghost'
                    size='icon-sm'
                    aria-label={toggleLabel}
                    title={toggleLabel}
                    onClick={onToggle}>
                    <PanelLeftIcon />
                </Button>
            )}
            {!isCollapsed && <span className='truncate text-sm font-semibold tracking-tight'>{SITE_NAME}</span>}
        </div>
    )
}
