'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, type FC } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { type BookingInput, type BookingValues } from '@/entities/trip/trip.validate'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { BookingAttachmentsField } from '@/features/trip-editor/booking-attachments-field'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { bookingsFormSchema, type BookingsFormInput, type BookingsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { BOOKING_PRIORITIES } from '@/shared/constant/trip'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const EMPTY_BOOKING = {
    title: '',
    whenLabel: null,
    priority: 'p2',
    linkLabel: null,
    linkUrl: null,
    actionNote: null,
    planStatus: null,
    attachments: [],
} satisfies BookingInput

type BookingsFormProps = {
    defaultValues: BookingInput[]
    onSubmit: EditorSubmit<BookingValues[]>
    isPending: boolean
    isUploadEnabled: boolean
    isUploading: boolean
    onUploadImage: (file: File) => Promise<UploadedImage | null>
}

export const BookingsForm: FC<BookingsFormProps> = ({ defaultValues, onSubmit, isPending, isUploadEnabled, isUploading, onUploadImage }) => {
    const t = useTranslations('tripEditor.bookings')
    const didResetRef = useRef(false)
    const form = useForm<BookingsFormInput, unknown, BookingsFormValues>({
        resolver: zodResolver(bookingsFormSchema),
        defaultValues: { items: defaultValues },
    })
    const rows = useFieldArray({ control: form.control, name: 'items', keyName: 'fieldKey' })

    const { errors, isDirty } = form.formState
    const itemErrors = errors.items
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit(values.items)
        if (isSaved) form.reset({ items: values.items })
    })

    useEffect(() => {
        if (didResetRef.current) return
        didResetRef.current = true
        form.reset({ items: defaultValues })
    }, [defaultValues, form])

    return (
        <FormProvider {...form}>
            <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()}>
                <EditorToolbar
                    title={t('title')}
                    description={t('description')}
                    count={rows.fields.length}
                    action={
                        <Button type='button' variant='cell' size='cell' onClick={() => rows.append(EMPTY_BOOKING)}>
                            <PlusIcon />
                            {t('add')}
                        </Button>
                    }
                />
                {rows.fields.length === 0 ? (
                    <p className='bg-card p-3 text-xs text-muted-foreground'>{t('empty')}</p>
                ) : (
                    <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                        {rows.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel={t('remove')}
                                onRemove={() => rows.remove(index)}>
                                <div className='flex flex-col gap-3'>
                                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                        <EditorField
                                            label={t('item')}
                                            htmlFor={`booking-${index}-title`}
                                            error={itemErrors?.[index]?.title?.message}
                                            className='lg:col-span-2'>
                                            <Input
                                                id={`booking-${index}-title`}
                                                className={EDITOR_INPUT_CLASS}
                                                aria-invalid={!!itemErrors?.[index]?.title}
                                                {...form.register(`items.${index}.title`)}
                                            />
                                        </EditorField>
                                        <EditorField
                                            label={t('when')}
                                            htmlFor={`booking-${index}-when`}
                                            error={itemErrors?.[index]?.whenLabel?.message}>
                                            <Input
                                                id={`booking-${index}-when`}
                                                className={EDITOR_INPUT_CLASS}
                                                placeholder={t('whenPlaceholder')}
                                                aria-invalid={!!itemErrors?.[index]?.whenLabel}
                                                {...form.register(`items.${index}.whenLabel`, EMPTY_TO_NULL)}
                                            />
                                        </EditorField>
                                        <EditorField
                                            label={t('priority')}
                                            htmlFor={`booking-${index}-priority`}
                                            error={itemErrors?.[index]?.priority?.message}>
                                            <NativeSelect
                                                id={`booking-${index}-priority`}
                                                className='w-full'
                                                size='sm'
                                                aria-invalid={!!itemErrors?.[index]?.priority}
                                                {...form.register(`items.${index}.priority`)}>
                                                {BOOKING_PRIORITIES.map((priority) => (
                                                    <NativeSelectOption key={priority} value={priority}>
                                                        {t(`priorities.${priority}`)}
                                                    </NativeSelectOption>
                                                ))}
                                            </NativeSelect>
                                        </EditorField>
                                        <EditorField
                                            label={t('linkLabel')}
                                            htmlFor={`booking-${index}-link-label`}
                                            error={itemErrors?.[index]?.linkLabel?.message}>
                                            <Input
                                                id={`booking-${index}-link-label`}
                                                className={EDITOR_INPUT_CLASS}
                                                placeholder={t('linkLabelPlaceholder')}
                                                aria-invalid={!!itemErrors?.[index]?.linkLabel}
                                                {...form.register(`items.${index}.linkLabel`, EMPTY_TO_NULL)}
                                            />
                                        </EditorField>
                                        <EditorField
                                            label={t('linkUrl')}
                                            htmlFor={`booking-${index}-link-url`}
                                            error={itemErrors?.[index]?.linkUrl?.message}
                                            className='lg:col-span-3'>
                                            <Input
                                                id={`booking-${index}-link-url`}
                                                className={EDITOR_INPUT_CLASS}
                                                type='url'
                                                placeholder='https://'
                                                aria-invalid={!!itemErrors?.[index]?.linkUrl}
                                                {...form.register(`items.${index}.linkUrl`, EMPTY_TO_NULL)}
                                            />
                                        </EditorField>
                                        <EditorField
                                            label={t('action')}
                                            htmlFor={`booking-${index}-action-note`}
                                            error={itemErrors?.[index]?.actionNote?.message}
                                            className='lg:col-span-2'>
                                            <Input
                                                id={`booking-${index}-action-note`}
                                                className={EDITOR_INPUT_CLASS}
                                                placeholder={t('actionPlaceholder')}
                                                aria-invalid={!!itemErrors?.[index]?.actionNote}
                                                {...form.register(`items.${index}.actionNote`, EMPTY_TO_NULL)}
                                            />
                                        </EditorField>
                                        <EditorField
                                            label={t('status')}
                                            htmlFor={`booking-${index}-plan-status`}
                                            error={itemErrors?.[index]?.planStatus?.message}
                                            className='lg:col-span-2'>
                                            <Input
                                                id={`booking-${index}-plan-status`}
                                                className={EDITOR_INPUT_CLASS}
                                                placeholder={t('statusPlaceholder')}
                                                aria-invalid={!!itemErrors?.[index]?.planStatus}
                                                {...form.register(`items.${index}.planStatus`, EMPTY_TO_NULL)}
                                            />
                                        </EditorField>
                                    </div>
                                    <BookingAttachmentsField
                                        bookingIndex={index}
                                        isUploadEnabled={isUploadEnabled}
                                        isUploading={isUploading}
                                        onUploadImage={onUploadImage}
                                    />
                                </div>
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
            </EditorFormShell>
        </FormProvider>
    )
}
