import { z } from 'zod'
import { PROFILE_BIO_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH, PROFILE_NAME_MIN_LENGTH } from '@/shared/constant/community'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '@/shared/constant/auth'

export const PROFILE_TABS = ['posts', 'trips', 'likes'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]

const DEFAULT_PROFILE_TAB: ProfileTab = 'posts'

export const resolveProfileTab = (value: string | string[] | undefined) => PROFILE_TABS.find((tab) => tab === value) ?? DEFAULT_PROFILE_TAB

export const profileUpdateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(PROFILE_NAME_MIN_LENGTH, `표시 이름은 ${PROFILE_NAME_MIN_LENGTH}자 이상 입력해 주세요.`)
        .max(PROFILE_NAME_MAX_LENGTH, `표시 이름은 ${PROFILE_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`),
    bio: z.string().trim().max(PROFILE_BIO_MAX_LENGTH, `소개는 ${PROFILE_BIO_MAX_LENGTH}자 이하로 입력해 주세요.`).nullable().default(null),
    avatarUploadId: z.uuid().nullable().optional(),
    bannerUploadId: z.uuid().nullable().optional(),
})

export const usernameChangeSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN_LENGTH, `사용자명은 ${USERNAME_MIN_LENGTH}자 이상 입력해 주세요.`)
    .max(USERNAME_MAX_LENGTH, `사용자명은 ${USERNAME_MAX_LENGTH}자 이하로 입력해 주세요.`)
    .regex(USERNAME_PATTERN, '사용자명은 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.')

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>
export type ProfileUpdateValues = z.output<typeof profileUpdateSchema>
export type UsernameChangeInput = z.input<typeof usernameChangeSchema>
export type UsernameChangeValues = z.output<typeof usernameChangeSchema>
