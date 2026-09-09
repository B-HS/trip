import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findProfileSettings } from '@/entities/profile/profile.repository'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { ProfileSettingsWidget } from '@/widgets/profile/profile-settings-widget'

export const metadata: Metadata = {
    title: '프로필 설정',
}

const ProfileSettingsPage = async () => {
    const user = await requireUser()
    const settings = await findProfileSettings(user.id)
    if (settings === null) notFound()

    return <ProfileSettingsWidget settings={settings} isUploadEnabled={getUploadConfig() !== null} />
}

export default ProfileSettingsPage
