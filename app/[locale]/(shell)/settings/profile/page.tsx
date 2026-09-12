import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { findBlockedUsersForUser } from '@/entities/community/community.repository.block'
import { findProfileSettings } from '@/entities/profile/profile.repository'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { ProfileSettingsWidget } from '@/widgets/profile/profile-settings-widget'
import { createPageMetadata } from '@/shared/lib/metadata'

type ProfileSettingsPageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: ProfileSettingsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.profile' })
    return createPageMetadata({ locale, path: '/settings/profile', title: t('title'), description: t('description'), indexable: false })
}

const ProfileSettingsPage = async () => {
    const user = await requireUser()
    const [settings, blockedUsers] = await Promise.all([findProfileSettings(user.id), findBlockedUsersForUser(user.id)])
    if (settings === null) notFound()

    return <ProfileSettingsWidget settings={settings} blockedUsers={blockedUsers} isUploadEnabled={getUploadConfig() !== null} />
}

export default ProfileSettingsPage
