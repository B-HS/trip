'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type FC } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { ScheduleKindInput, ScheduleKindsSaveValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { scheduleKindsFormSchema, type ScheduleKindsFormInput, type ScheduleKindsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { SCHEDULE_KIND_SWATCH_CLASS } from '@/features/trip-viewer/trip-viewer-kind'
import { SCHEDULE_KIND_COLOR_TOKENS, SCHEDULE_KIND_MIN_COUNT } from '@/shared/constant/trip'
import { translateMessage } from '@/shared/lib/message-key'
import { cn } from '@/shared/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const NO_USAGE_COUNT = 0

const toEmptyKind = () =>
    ({ key: crypto.randomUUID(), label: '', legendLabel: '', colorToken: 'muted', bufferLabel: null }) satisfies ScheduleKindInput

type KindsFormProps = {
    defaultValues: ScheduleKindInput[]
    usageByKindId: Record<string, number>
    onSubmit: EditorSubmit<ScheduleKindsSaveValues>
    isPending: boolean
}

export const KindsForm: FC<KindsFormProps> = ({ defaultValues, usageByKindId, onSubmit, isPending }) => {
    const t = useTranslations('tripEditor.kinds')
    const tMessage = useTranslations()
    const didResetRef = useRef(false)
    const [replacements, setReplacements] = useState<Record<string, string>>({})
    const [removeIndex, setRemoveIndex] = useState<number | null>(null)
    const [replacementId, setReplacementId] = useState<string | null>(null)
    const form = useForm<ScheduleKindsFormInput, unknown, ScheduleKindsFormValues>({
        resolver: zodResolver(scheduleKindsFormSchema),
        defaultValues: { items: defaultValues },
    })
    const rows = useFieldArray({ control: form.control, name: 'items', keyName: 'fieldKey' })
    const items = useWatch({ control: form.control, name: 'items' })

    const { errors, isDirty } = form.formState
    const itemErrors = errors.items
    const isRemovable = rows.fields.length > SCHEDULE_KIND_MIN_COUNT
    const removeTargetId = removeIndex === null ? undefined : rows.fields[removeIndex]?.id
    const removeUsage = removeTargetId === undefined ? NO_USAGE_COUNT : (usageByKindId[removeTargetId] ?? NO_USAGE_COUNT)
    const removeLabel = removeIndex === null ? '' : (items?.[removeIndex]?.label ?? '')
    const handleRequestRemove = (index: number) => {
        setRemoveIndex(index)
        setReplacementId(rows.fields.find((row, rowIndex) => rowIndex !== index && row.id !== undefined)?.id ?? null)
    }
    const handleConfirmRemove = () => {
        if (removeIndex === null) return
        if (removeTargetId !== undefined && removeUsage > NO_USAGE_COUNT && replacementId !== null)
            setReplacements((previous) => ({ ...previous, [removeTargetId]: replacementId }))
        rows.remove(removeIndex)
        setRemoveIndex(null)
        setReplacementId(null)
    }
    const handleReset = () => {
        form.reset()
        setReplacements({})
    }
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit({ kinds: values.items, replacements })
        if (!isSaved) return
        form.reset({ items: values.items })
        setReplacements({})
    })

    useEffect(() => {
        if (didResetRef.current) return
        didResetRef.current = true
        form.reset({ items: defaultValues })
    }, [defaultValues, form])

    return (
        <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={handleReset}>
            <EditorToolbar
                title={t('title')}
                description={t('description')}
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append(toEmptyKind())}>
                        <PlusIcon />
                        {t('add')}
                    </Button>
                }
            />
            {itemErrors?.root?.message !== undefined && (
                <p className='bg-card p-3 text-xs text-destructive'>{translateMessage(tMessage, itemErrors.root.message)}</p>
            )}
            <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                {rows.fields.map((row, index) => (
                    <SortableRow
                        key={row.fieldKey}
                        id={row.fieldKey}
                        index={index}
                        removeLabel={t('remove')}
                        onRemove={isRemovable ? () => handleRequestRemove(index) : undefined}>
                        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                            <EditorField label={t('name')} htmlFor={`kind-${index}-label`} error={itemErrors?.[index]?.label?.message}>
                                <Input
                                    id={`kind-${index}-label`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder={t('namePlaceholder')}
                                    aria-invalid={!!itemErrors?.[index]?.label}
                                    {...form.register(`items.${index}.label`)}
                                />
                            </EditorField>
                            <EditorField label={t('legend')} htmlFor={`kind-${index}-legend`} error={itemErrors?.[index]?.legendLabel?.message}>
                                <Input
                                    id={`kind-${index}-legend`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder={t('legendPlaceholder')}
                                    aria-invalid={!!itemErrors?.[index]?.legendLabel}
                                    {...form.register(`items.${index}.legendLabel`)}
                                />
                            </EditorField>
                            <EditorField label={t('color')} htmlFor={`kind-${index}-color`} error={itemErrors?.[index]?.colorToken?.message}>
                                <Controller
                                    control={form.control}
                                    name={`items.${index}.colorToken`}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id={`kind-${index}-color`} className='w-full' size='sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SCHEDULE_KIND_COLOR_TOKENS.map((token) => (
                                                    <SelectItem key={token} value={token}>
                                                        <span aria-hidden className={cn('size-2 shrink-0', SCHEDULE_KIND_SWATCH_CLASS[token])} />
                                                        {t(`colors.${token}`)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </EditorField>
                            <EditorField label={t('buffer')} htmlFor={`kind-${index}-buffer`} error={itemErrors?.[index]?.bufferLabel?.message}>
                                <Input
                                    id={`kind-${index}-buffer`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder={t('bufferPlaceholder')}
                                    aria-invalid={!!itemErrors?.[index]?.bufferLabel}
                                    {...form.register(`items.${index}.bufferLabel`, EMPTY_TO_NULL)}
                                />
                            </EditorField>
                        </div>
                    </SortableRow>
                ))}
            </SortableRows>
            <AlertDialog open={removeIndex !== null} onOpenChange={(open) => !open && setRemoveIndex(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteTitle', { name: removeLabel })}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {removeUsage > NO_USAGE_COUNT ? t('deleteUsed', { count: removeUsage }) : t('deleteUnused')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {removeUsage > NO_USAGE_COUNT && (
                        <Select value={replacementId ?? undefined} onValueChange={setReplacementId}>
                            <SelectTrigger className='w-full' aria-label={t('replacement')}>
                                <SelectValue placeholder={t('replacementPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {rows.fields.map((row, index) =>
                                    row.id === undefined || index === removeIndex ? null : (
                                        <SelectItem key={row.fieldKey} value={row.id}>
                                            {items?.[index]?.label ?? row.label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    )}
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell'>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant='cellDestructive'
                            size='cell'
                            disabled={removeUsage > NO_USAGE_COUNT && replacementId === null}
                            onClick={handleConfirmRemove}>
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </EditorFormShell>
    )
}
