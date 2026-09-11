'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { changeUsernameAction, updateProfileAction } from '@/entities/profile/profile.action'
import type { ProfileUpdateInput, UsernameChangeInput } from '@/entities/profile/profile.validate'
import { unwrapActionResult } from '@/shared/lib/action-result'

export const useUpdateProfile = () =>
    useMutation({
        mutationFn: async (input: ProfileUpdateInput) => unwrapActionResult(await updateProfileAction(input)),
        onSuccess: () => toast.success('프로필을 저장했습니다.'),
        onError: (error) => toast.error(error.message),
    })

export const useChangeUsername = () =>
    useMutation({
        mutationFn: async (input: UsernameChangeInput) => unwrapActionResult(await changeUsernameAction(input)),
        onSuccess: () => toast.success('사용자명을 변경했습니다.'),
        onError: (error) => toast.error(error.message),
    })
