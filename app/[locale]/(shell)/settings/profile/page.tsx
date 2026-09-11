import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findBlockedUsersForUser } from '@/entities/community/community.repository.block'
import { findProfileSettings } from '@/entities/profile/profile.repository'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { ProfileSettingsWidget } from '@/widgets/profile/profile-settings-widget'

export const metadata: Metadata = {
    title: '프로필 설정',
}

const ProfileSettingsPage = async () => {
    const user = await requireUser()
    const [settings, blockedUsers] = await Promise.all([findProfileSettings(user.id), findBlockedUsersForUser(user.id)])
    if (settings === null) notFound()

    return <ProfileSettingsWidget settings={settings} blockedUsers={blockedUsers} isUploadEnabled={getUploadConfig() !== null} />
}

export default ProfileSettingsPage
