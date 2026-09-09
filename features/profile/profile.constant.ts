import type { ProfileTab } from '@/entities/profile/profile.validate'

export const PROFILE_TAB_LABEL = {
    posts: '글',
    trips: '공개 트립',
    likes: '좋아요한 트립',
} as const satisfies Record<ProfileTab, string>

export const PROFILE_TABS_LABEL = '프로필 탭'
export const PROFILE_SETTINGS_LABEL = '프로필 설정'
