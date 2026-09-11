'use client'

import { useRouter } from '@/i18n/navigation'
import { useState, type FC } from 'react'
import { useUnblockUser } from '@/entities/community/community.query'
import type { PostAuthor } from '@/entities/community/community.type'
import { useUpdateProfile } from '@/entities/profile/profile.query'
import type { ProfileSettings } from '@/entities/profile/profile.type'
import { useUploadImage } from '@/entities/upload/upload.query'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { BlockedUsersSection } from '@/features/profile/blocked-users-section'
import { ProfileSettingsForm, type ProfileSettingsFormValues } from '@/features/profile/profile-settings-form'
import { UsernameChangeWidget } from '@/widgets/profile/username-change-widget'

const AVATAR_KIND = 'avatar'
const BANNER_KIND = 'banner'
const KEEP_IMAGE = 'keep'
const REMOVE_IMAGE = 'remove'
const DESCRIPTION = '프로필에서 다른 여행자에게 보이는 정보입니다.'

type ProfileImageState = typeof KEEP_IMAGE | typeof REMOVE_IMAGE | UploadedImage

const toUploadId = (state: ProfileImageState) => {
    if (state === KEEP_IMAGE) return undefined
    if (state === REMOVE_IMAGE) return null
    return state.id
}

const toPreviewUrl = (state: ProfileImageState, currentUrl: string | null) => {
    if (state === KEEP_IMAGE) return currentUrl
    if (state === REMOVE_IMAGE) return null
    return state.url
}

export type ProfileSettingsWidgetProps = {
    settings: ProfileSettings
    blockedUsers: PostAuthor[]
    isUploadEnabled: boolean
}

export const ProfileSettingsWidget: FC<ProfileSettingsWidgetProps> = ({ settings, blockedUsers, isUploadEnabled }) => {
    const [avatarState, setAvatarState] = useState<ProfileImageState>(KEEP_IMAGE)
    const [bannerState, setBannerState] = useState<ProfileImageState>(KEEP_IMAGE)
    const router = useRouter()
    const uploadAvatar = useUploadImage(AVATAR_KIND)
    const uploadBanner = useUploadImage(BANNER_KIND)
    const updateProfile = useUpdateProfile()
    const unblockUser = useUnblockUser()

    const handleSubmit = async (values: ProfileSettingsFormValues) => {
        try {
            await updateProfile.mutateAsync({ ...values, avatarUploadId: toUploadId(avatarState), bannerUploadId: toUploadId(bannerState) })
            router.refresh()
            return true
        } catch {
            return false
        }
    }

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>PROFILE</p>
                <h1 className='text-2xl font-semibold tracking-tight'>프로필 설정</h1>
                <p className='text-xs text-muted-foreground'>{DESCRIPTION}</p>
            </section>
            <ProfileSettingsForm
                defaultValues={{ name: settings.name, bio: settings.bio }}
                avatar={{
                    previewUrl: toPreviewUrl(avatarState, settings.image),
                    isUploadEnabled,
                    isUploading: uploadAvatar.isPending,
                    onUpload: (file) => uploadAvatar.mutate(file, { onSuccess: (uploaded) => setAvatarState(uploaded) }),
                    onRemove: () => setAvatarState(REMOVE_IMAGE),
                }}
                banner={{
                    previewUrl: toPreviewUrl(bannerState, settings.bannerUrl),
                    isUploadEnabled,
                    isUploading: uploadBanner.isPending,
                    onUpload: (file) => uploadBanner.mutate(file, { onSuccess: (uploaded) => setBannerState(uploaded) }),
                    onRemove: () => setBannerState(REMOVE_IMAGE),
                }}
                isPending={updateProfile.isPending}
                onSubmit={handleSubmit}
            />
            <UsernameChangeWidget currentUsername={settings.username} />
            <BlockedUsersSection
                users={blockedUsers}
                isPending={unblockUser.isPending}
                onUnblock={(userId) => unblockUser.mutate(userId, { onSuccess: () => router.refresh() })}
            />
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
