'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
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
import { SCHEDULE_KIND_COLOR_TOKEN_LABEL, SCHEDULE_KIND_COLOR_TOKENS, SCHEDULE_KIND_MIN_COUNT } from '@/shared/constant/trip'
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
                title='일정 종류'
                description='타임라인 배지와 범례에 쓰는 종류입니다. 순서는 범례에 그대로 반영합니다.'
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append(toEmptyKind())}>
                        <PlusIcon />
                        종류 추가
                    </Button>
                }
            />
            {itemErrors?.root !== undefined && <p className='bg-card p-3 text-xs text-destructive'>{itemErrors.root.message}</p>}
            <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                {rows.fields.map((row, index) => (
                    <SortableRow
                        key={row.fieldKey}
                        id={row.fieldKey}
                        index={index}
                        removeLabel='종류 삭제'
                        onRemove={isRemovable ? () => handleRequestRemove(index) : undefined}>
                        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                            <EditorField label='이름' htmlFor={`kind-${index}-label`} error={itemErrors?.[index]?.label?.message}>
                                <Input
                                    id={`kind-${index}-label`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder='계획'
                                    aria-invalid={!!itemErrors?.[index]?.label}
                                    {...form.register(`items.${index}.label`)}
                                />
                            </EditorField>
                            <EditorField label='범례 라벨' htmlFor={`kind-${index}-legend`} error={itemErrors?.[index]?.legendLabel?.message}>
                                <Input
                                    id={`kind-${index}-legend`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder='계획 일정'
                                    aria-invalid={!!itemErrors?.[index]?.legendLabel}
                                    {...form.register(`items.${index}.legendLabel`)}
                                />
                            </EditorField>
                            <EditorField label='색' htmlFor={`kind-${index}-color`} error={itemErrors?.[index]?.colorToken?.message}>
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
                                                        {SCHEDULE_KIND_COLOR_TOKEN_LABEL[token]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </EditorField>
                            <EditorField label='여유 문구' htmlFor={`kind-${index}-buffer`} error={itemErrors?.[index]?.bufferLabel?.message}>
                                <Input
                                    id={`kind-${index}-buffer`}
                                    className={EDITOR_INPUT_CLASS}
                                    placeholder='마지막 10분 여유'
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
                        <AlertDialogTitle>{`'${removeLabel}' 종류를 삭제할까요?`}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {removeUsage > NO_USAGE_COUNT
                                ? `이 종류를 쓰는 일정이 ${removeUsage}건 있습니다. 대신할 종류를 고르면 저장할 때 함께 바꿉니다.`
                                : '이 종류를 쓰는 일정이 없습니다. 저장할 때 목록에서 제거합니다.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {removeUsage > NO_USAGE_COUNT && (
                        <Select value={replacementId ?? undefined} onValueChange={setReplacementId}>
                            <SelectTrigger className='w-full' aria-label='대체 종류'>
                                <SelectValue placeholder='대체 종류 선택' />
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
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant='cellDestructive'
                            size='cell'
                            disabled={removeUsage > NO_USAGE_COUNT && replacementId === null}
                            onClick={handleConfirmRemove}>
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </EditorFormShell>
    )
}
