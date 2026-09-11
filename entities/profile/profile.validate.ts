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
        .min(PROFILE_NAME_MIN_LENGTH, 'validation.profileNameTooShort')
        .max(PROFILE_NAME_MAX_LENGTH, 'validation.profileNameTooLong'),
    bio: z.string().trim().max(PROFILE_BIO_MAX_LENGTH, 'validation.bioTooLong').nullable().default(null),
    avatarUploadId: z.uuid().nullable().optional(),
    bannerUploadId: z.uuid().nullable().optional(),
})

export const usernameChangeSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN_LENGTH, 'validation.usernameTooShort')
    .max(USERNAME_MAX_LENGTH, 'validation.usernameTooLong')
    .regex(USERNAME_PATTERN, 'validation.usernamePattern')

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>
export type ProfileUpdateValues = z.output<typeof profileUpdateSchema>
export type UsernameChangeInput = z.input<typeof usernameChangeSchema>
export type UsernameChangeValues = z.output<typeof usernameChangeSchema>
