import type { ProfileTab } from '@/entities/profile/profile.validate'

export const PROFILE_TAB_LABEL = {
    posts: '글',
    trips: '공개 트립',
    likes: '좋아요한 트립',
} as const satisfies Record<ProfileTab, string>

export const PROFILE_TABS_LABEL = '프로필 탭'
export const PROFILE_SETTINGS_LABEL = '프로필 설정'

export const BLOCKED_SECTION_TITLE = '차단한 사용자'
export const BLOCKED_SECTION_DESCRIPTION = '차단한 사용자의 글과 댓글은 보이지 않습니다.'
export const BLOCKED_EMPTY_LABEL = '차단한 사용자가 없습니다.'

export const USERNAME_SECTION_TITLE = '사용자명 변경'
export const USERNAME_SECTION_DESCRIPTION = '영문 소문자·숫자·밑줄(_)·마침표(.)로 3~30자.'
export const USERNAME_LABEL = '새 사용자명'
export const USERNAME_INPUT_PLACEHOLDER = 'new_username'
export const USERNAME_SUBMIT_LABEL = '사용자명 변경'
export const USERNAME_SUBMITTING_LABEL = '변경 중…'
