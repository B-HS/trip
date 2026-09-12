'use client'
'use no memo'

import { ImagePlusIcon, LinkIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, type ChangeEvent, type FC } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL } from '@/features/trip-editor/editor-form'
import type { BookingsFormInput, BookingsFormValues } from '@/features/trip-editor/editor-schema'
import { UPLOAD_IMAGE_ACCEPT } from '@/shared/constant/upload'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const EMPTY_LINK_ATTACHMENT = { kind: 'link', url: '', label: null, uploadId: null } as const

type BookingAttachmentsFieldProps = {
    bookingIndex: number
    isUploadEnabled: boolean
    isUploading: boolean
    onUploadImage: (file: File) => Promise<UploadedImage | null>
}

export const BookingAttachmentsField: FC<BookingAttachmentsFieldProps> = ({ bookingIndex, isUploadEnabled, isUploading, onUploadImage }) => {
    const t = useTranslations('tripEditor.attachments')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { control, register, formState } = useFormContext<BookingsFormInput, unknown, BookingsFormValues>()
    const attachments = useFieldArray({ control, name: `items.${bookingIndex}.attachments`, keyName: 'fieldKey' })

    const errors = formState.errors.items?.[bookingIndex]?.attachments

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        const uploaded = await onUploadImage(file)
        if (uploaded === null) return
        attachments.append({ kind: 'image', url: uploaded.url, label: null, uploadId: uploaded.id })
    }

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
                <span className='text-xs font-medium text-muted-foreground'>{t('count', { count: attachments.fields.length })}</span>
                <div className='flex gap-px bg-background'>
                    <Button type='button' variant='cell' size='cell' onClick={() => attachments.append({ ...EMPTY_LINK_ATTACHMENT })}>
                        <LinkIcon />
                        {t('addLink')}
                    </Button>
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        disabled={!isUploadEnabled || isUploading}
                        onClick={() => fileInputRef.current?.click()}>
                        <ImagePlusIcon />
                        {t('uploadImage')}
                    </Button>
                </div>
            </div>
            {!isUploadEnabled && <p className='text-xs text-muted-foreground'>{t('uploadDisabled')}</p>}
            {attachments.fields.map((attachment, attachmentIndex) => (
                <div key={attachment.fieldKey} className='flex items-end gap-2'>
                    <EditorField
                        label={t('label')}
                        htmlFor={`booking-${bookingIndex}-attachment-${attachmentIndex}-label`}
                        error={errors?.[attachmentIndex]?.label?.message}
                        className='min-w-32 flex-1'>
                        <Input
                            id={`booking-${bookingIndex}-attachment-${attachmentIndex}-label`}
                            className={EDITOR_INPUT_CLASS}
                            placeholder={t('labelPlaceholder')}
                            aria-invalid={!!errors?.[attachmentIndex]?.label}
                            {...register(`items.${bookingIndex}.attachments.${attachmentIndex}.label`, EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    {attachment.kind === 'image' ? (
                        <EditorField
                            label={t('imageUrl')}
                            htmlFor={`booking-${bookingIndex}-attachment-${attachmentIndex}-url`}
                            error={errors?.[attachmentIndex]?.url?.message}
                            className='min-w-48 flex-2'>
                            <Input
                                id={`booking-${bookingIndex}-attachment-${attachmentIndex}-url`}
                                className={EDITOR_INPUT_CLASS}
                                readOnly
                                value={attachment.url}
                            />
                        </EditorField>
                    ) : (
                        <EditorField
                            label={t('url')}
                            htmlFor={`booking-${bookingIndex}-attachment-${attachmentIndex}-url`}
                            error={errors?.[attachmentIndex]?.url?.message}
                            className='min-w-48 flex-2'>
                            <Input
                                id={`booking-${bookingIndex}-attachment-${attachmentIndex}-url`}
                                className={EDITOR_INPUT_CLASS}
                                type='url'
                                placeholder='https://'
                                aria-invalid={!!errors?.[attachmentIndex]?.url}
                                {...register(`items.${bookingIndex}.attachments.${attachmentIndex}.url`)}
                            />
                        </EditorField>
                    )}
                    <Button
                        className='mb-1 size-6 shrink-0'
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label={t('remove')}
                        onClick={() => attachments.remove(attachmentIndex)}>
                        <Trash2Icon />
                    </Button>
                </div>
            ))}
            <input
                ref={fileInputRef}
                className='hidden'
                type='file'
                aria-label={t('fileInput')}
                accept={UPLOAD_IMAGE_ACCEPT}
                onChange={handleFileChange}
            />
        </div>
    )
}
