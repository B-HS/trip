'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, type FC } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { type LodgingInput, type LodgingValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { lodgingsFormSchema, type LodgingsFormInput, type LodgingsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const EMPTY_LODGING = {
    name: '',
    nameLocal: null,
    address: null,
    accessNote: null,
    checkIn: null,
    checkOut: null,
    url: null,
    note: null,
} satisfies LodgingInput

type LodgingsFormProps = {
    defaultValues: LodgingInput[]
    onSubmit: EditorSubmit<LodgingValues[]>
    isPending: boolean
}

export const LodgingsForm: FC<LodgingsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const t = useTranslations('tripEditor.lodgings')
    const didResetRef = useRef(false)
    const form = useForm<LodgingsFormInput, unknown, LodgingsFormValues>({
        resolver: zodResolver(lodgingsFormSchema),
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
        <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()}>
            <EditorToolbar
                title={t('title')}
                description={t('description')}
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append(EMPTY_LODGING)}>
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
                        <SortableRow key={row.fieldKey} id={row.fieldKey} index={index} removeLabel={t('remove')} onRemove={() => rows.remove(index)}>
                            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                <EditorField label={t('name')} htmlFor={`lodging-${index}-name`} error={itemErrors?.[index]?.name?.message}>
                                    <Input
                                        id={`lodging-${index}-name`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!itemErrors?.[index]?.name}
                                        {...form.register(`items.${index}.name`)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('localName')}
                                    htmlFor={`lodging-${index}-name-local`}
                                    error={itemErrors?.[index]?.nameLocal?.message}>
                                    <Input
                                        id={`lodging-${index}-name-local`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!itemErrors?.[index]?.nameLocal}
                                        {...form.register(`items.${index}.nameLocal`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField label={t('checkIn')} htmlFor={`lodging-${index}-check-in`} error={itemErrors?.[index]?.checkIn?.message}>
                                    <Input
                                        id={`lodging-${index}-check-in`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono`}
                                        placeholder='15:00'
                                        aria-invalid={!!itemErrors?.[index]?.checkIn}
                                        {...form.register(`items.${index}.checkIn`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('checkOut')}
                                    htmlFor={`lodging-${index}-check-out`}
                                    error={itemErrors?.[index]?.checkOut?.message}>
                                    <Input
                                        id={`lodging-${index}-check-out`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono`}
                                        placeholder='11:00'
                                        aria-invalid={!!itemErrors?.[index]?.checkOut}
                                        {...form.register(`items.${index}.checkOut`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('address')}
                                    htmlFor={`lodging-${index}-address`}
                                    error={itemErrors?.[index]?.address?.message}
                                    className='sm:col-span-2'>
                                    <Input
                                        id={`lodging-${index}-address`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!itemErrors?.[index]?.address}
                                        {...form.register(`items.${index}.address`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('link')}
                                    htmlFor={`lodging-${index}-url`}
                                    error={itemErrors?.[index]?.url?.message}
                                    className='sm:col-span-2'>
                                    <Input
                                        id={`lodging-${index}-url`}
                                        className={EDITOR_INPUT_CLASS}
                                        type='url'
                                        placeholder='https://'
                                        aria-invalid={!!itemErrors?.[index]?.url}
                                        {...form.register(`items.${index}.url`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('access')}
                                    htmlFor={`lodging-${index}-access-note`}
                                    error={itemErrors?.[index]?.accessNote?.message}
                                    className='sm:col-span-2'>
                                    <Input
                                        id={`lodging-${index}-access-note`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder={t('accessPlaceholder')}
                                        aria-invalid={!!itemErrors?.[index]?.accessNote}
                                        {...form.register(`items.${index}.accessNote`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label={t('note')}
                                    htmlFor={`lodging-${index}-note`}
                                    error={itemErrors?.[index]?.note?.message}
                                    className='sm:col-span-2'>
                                    <Input
                                        id={`lodging-${index}-note`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!itemErrors?.[index]?.note}
                                        {...form.register(`items.${index}.note`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                            </div>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
        </EditorFormShell>
    )
}
