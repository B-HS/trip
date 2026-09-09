'use server'

import { revalidatePath } from 'next/cache'
import { updateProfile } from '@/entities/profile/profile.repository'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/entities/profile/profile.validate'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'

export const updateProfileAction = async (input: ProfileUpdateInput) => {
    const user = await requireUser()
    return runAction(async () => {
        const settings = await updateProfile(user.id, profileUpdateSchema.parse(input))
        revalidatePath('/settings/profile')
        if (settings.username !== null) revalidatePath(`/u/${settings.username}`)
        return settings
    })
}
