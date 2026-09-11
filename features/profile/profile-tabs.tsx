import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { PROFILE_TABS, type ProfileTab } from '@/entities/profile/profile.validate'
import { PROFILE_TAB_PARAM } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'

export type ProfileTabsProps = {
    activeTab: ProfileTab
}

export const ProfileTabs: FC<ProfileTabsProps> = ({ activeTab }) => {
    const t = useTranslations('profile.tabs')

    return (
        <nav className='flex flex-wrap items-stretch gap-px bg-background' aria-label={t('aria')}>
            {PROFILE_TABS.map((tab) => (
                <Button key={tab} variant='cell' size='cell' asChild>
                    <Link href={`?${PROFILE_TAB_PARAM}=${tab}`} aria-current={tab === activeTab ? 'page' : undefined}>
                        {t(tab)}
                    </Link>
                </Button>
            ))}
            <div aria-hidden className='min-w-0 flex-1 bg-card' />
        </nav>
    )
}
