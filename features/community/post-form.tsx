'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Controller, useForm } from 'react-hook-form'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { postFormSchema, type PostFormInput, type PostFormValues } from '@/features/community/post-form.schema'
import { RichEditor } from '@/features/editor/rich-editor'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { POST_TITLE_MAX_LENGTH } from '@/shared/constant/community'
import { useUnsavedChanges } from '@/shared/hooks/use-unsaved-changes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const TITLE_FIELD_ID = 'post-title'
const TRIP_FIELD_ID = 'post-trip'
const BODY_ERROR_ID = 'post-body-error'
const NO_TRIP_VALUE = 'none'

export type PostFormTrip = {
    id: string
    title: string
}

export type PostFormProps<T extends string> = {
    defaultValues: PostFormInput
    trips: PostFormTrip[]
    cancelHref: T
    isUploadEnabled: boolean
    isUploading: boolean
    isPending: boolean
    onUploadImage: (file: File) => Promise<UploadedImage | null>
    onSubmit: EditorSubmit<PostFormValues>
}

export const PostForm = <T extends string>({
    defaultValues,
    trips,
    cancelHref,
    isUploadEnabled,
    isUploading,
    isPending,
    onUploadImage,
    onSubmit,
}: PostFormProps<T>) => {
    const t = useTranslations('community.post')
    const tError = useTranslations('error')
    const form = useForm<PostFormInput, unknown, PostFormValues>({ resolver: zodResolver(postFormSchema), defaultValues })

    const { errors, isDirty } = form.formState
    const bodyError = errors.body?.message
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit(values)
        if (isSaved) form.reset(values)
    })

    useUnsavedChanges(isDirty)

    return (
        <form className='flex flex-col gap-px bg-background' onSubmit={handleSubmit} noValidate>
            <div className='flex flex-col gap-3 bg-card p-3'>
                <EditorField label={t('titleLabel')} htmlFor={TITLE_FIELD_ID} error={errors.title?.message}>
                    <Input
                        id={TITLE_FIELD_ID}
                        className={EDITOR_INPUT_CLASS}
                        maxLength={POST_TITLE_MAX_LENGTH}
                        aria-invalid={!!errors.title}
                        {...form.register('title')}
                    />
                </EditorField>
                <EditorField label={t('tripLabel')} htmlFor={TRIP_FIELD_ID} error={errors.tripId?.message}>
                    <Controller
                        control={form.control}
                        name='tripId'
                        render={({ field }) => (
                            <Select
                                value={field.value ?? NO_TRIP_VALUE}
                                onValueChange={(value) => field.onChange(value === NO_TRIP_VALUE ? null : value)}>
                                <SelectTrigger id={TRIP_FIELD_ID} className='w-full rounded-none'>
                                    <SelectValue placeholder={t('tripPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_TRIP_VALUE}>{t('tripPlaceholder')}</SelectItem>
                                    {trips.map((trip) => (
                                        <SelectItem key={trip.id} value={trip.id}>
                                            {trip.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </EditorField>
            </div>
            <Controller
                control={form.control}
                name='body'
                render={({ field }) => (
                    <RichEditor
                        content={field.value}
                        label={t('bodyLabel')}
                        isUploadEnabled={isUploadEnabled}
                        isUploading={isUploading}
                        isInvalid={typeof bodyError === 'string'}
                        errorId={BODY_ERROR_ID}
                        onChange={field.onChange}
                        onUploadImage={onUploadImage}
                    />
                )}
            />
            {typeof bodyError === 'string' && (
                <p id={BODY_ERROR_ID} role='alert' className='bg-card p-3 text-xs text-destructive'>
                    {bodyError}
                </p>
            )}
            {!isUploadEnabled && <p className='bg-card p-3 text-xs text-muted-foreground'>{tError('uploadDisabled')}</p>}
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <Button variant='cell' size='cell' asChild>
                    <Link href={cancelHref}>{t('cancel')}</Link>
                </Button>
                <Button type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        </form>
    )
}
