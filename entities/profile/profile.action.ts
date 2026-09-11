'use server'

import { revalidatePath } from 'next/cache'
import { changeUsername, isUsernameTaken, updateProfile } from '@/entities/profile/profile.repository'
import { profileUpdateSchema, usernameChangeSchema, type ProfileUpdateInput, type UsernameChangeInput } from '@/entities/profile/profile.validate'
import { ApiError } from '@/shared/lib/api-response'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'

const USERNAME_TAKEN = '이미 사용 중인 사용자명입니다. 다른 사용자명을 입력해 주세요.'

export const updateProfileAction = async (input: ProfileUpdateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const settings = await updateProfile(user.id, profileUpdateSchema.parse(input))
        revalidatePath('/settings/profile')
        if (settings.username !== null) revalidatePath(`/u/${settings.username}`)
        return settings
    })
}

export const changeUsernameAction = async (input: UsernameChangeInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const username = usernameChangeSchema.parse(input)
        if (username === user.username) throw new ApiError('VALIDATION_ERROR', '현재 사용자명과 같습니다.')
        if (await isUsernameTaken(username)) throw new ApiError('VALIDATION_ERROR', USERNAME_TAKEN)
        const settings = await changeUsername(user.id, username)
        revalidatePath('/settings/profile')
        revalidatePath(`/u/${username}`)
        return settings
    })
}
