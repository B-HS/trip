'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { profileUpdateSchema } from '@/entities/profile/profile.validate'
import { ProfileImageField, type ProfileImageFieldProps } from '@/features/profile/profile-image-field'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { PROFILE_BIO_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH } from '@/shared/constant/community'
import { useUnsavedChanges } from '@/shared/hooks/use-unsaved-changes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const NAME_FIELD_ID = 'profile-name'
const BIO_FIELD_ID = 'profile-bio'

const profileSettingsFormSchema = profileUpdateSchema.pick({ name: true, bio: true })

export type ProfileSettingsFormInput = z.input<typeof profileSettingsFormSchema>
export type ProfileSettingsFormValues = z.output<typeof profileSettingsFormSchema>

type ProfileImageControl = Omit<ProfileImageFieldProps, 'label' | 'shape'>

export type ProfileSettingsFormProps = {
    defaultValues: ProfileSettingsFormInput
    avatar: ProfileImageControl
    banner: ProfileImageControl
    isPending: boolean
    onSubmit: EditorSubmit<ProfileSettingsFormValues>
}

export const ProfileSettingsForm: FC<ProfileSettingsFormProps> = ({ defaultValues, avatar, banner, isPending, onSubmit }) => {
    const t = useTranslations('profile.form')
    const form = useForm<ProfileSettingsFormInput, unknown, ProfileSettingsFormValues>({
        resolver: zodResolver(profileSettingsFormSchema),
        defaultValues,
    })

    const { errors, isDirty } = form.formState
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit(values)
        if (isSaved) form.reset(values)
    })

    useUnsavedChanges(isDirty)

    return (
        <form className='flex flex-col gap-px bg-background' onSubmit={handleSubmit} noValidate>
            <div className='flex flex-col gap-3 bg-card p-3'>
                <EditorField label={t('name')} htmlFor={NAME_FIELD_ID} error={errors.name?.message}>
                    <Input
                        id={NAME_FIELD_ID}
                        className={EDITOR_INPUT_CLASS}
                        maxLength={PROFILE_NAME_MAX_LENGTH}
                        aria-invalid={!!errors.name}
                        {...form.register('name')}
                    />
                </EditorField>
                <EditorField label={t('bio')} htmlFor={BIO_FIELD_ID} error={errors.bio?.message}>
                    <Textarea
                        id={BIO_FIELD_ID}
                        className='min-h-24'
                        maxLength={PROFILE_BIO_MAX_LENGTH}
                        aria-invalid={!!errors.bio}
                        {...form.register('bio', EMPTY_TO_NULL)}
                    />
                </EditorField>
            </div>
            <div className='flex flex-col gap-4 bg-card p-3'>
                <ProfileImageField label={t('avatar')} shape='avatar' {...avatar} />
                <ProfileImageField label={t('banner')} shape='banner' {...banner} />
            </div>
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <Button type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        </form>
    )
}
