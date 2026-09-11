import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC, ReactNode } from 'react'
import { SITE_NAME } from '@/shared/constant/site'

type PublicHeaderProps = {
    actions: ReactNode
}

export const PublicHeader: FC<PublicHeaderProps> = ({ actions }) => {
    const t = useTranslations('common')

    return (
        <header className='sticky top-0 z-50 h-12 w-full border-b border-border bg-background/60 supports-backdrop-filter:backdrop-blur-xs'>
            <div className='mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4'>
                <Link className='text-sm font-extrabold tracking-tight' href='/'>
                    {SITE_NAME}
                </Link>
                <nav className='flex items-center gap-1' aria-label={t('nav.mainMenu')}>
                    {actions}
                </nav>
            </div>
        </header>
    )
}
