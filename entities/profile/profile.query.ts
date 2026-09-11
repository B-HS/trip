'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { translateMessage } from '@/shared/lib/message-key'
import { changeUsernameAction, updateProfileAction } from '@/entities/profile/profile.action'
import type { ProfileUpdateInput, UsernameChangeInput } from '@/entities/profile/profile.validate'
import { unwrapActionResult } from '@/shared/lib/action-result'

export const useUpdateProfile = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: ProfileUpdateInput) => unwrapActionResult(await updateProfileAction(input)),
        onSuccess: () => toast.success(t('profile.toast.saved')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}

export const useChangeUsername = () => {
    const t = useTranslations()
    return useMutation({
        mutationFn: async (input: UsernameChangeInput) => unwrapActionResult(await changeUsernameAction(input)),
        onSuccess: () => toast.success(t('profile.toast.usernameChanged')),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}
