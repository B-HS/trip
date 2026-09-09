'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { type BookingInput, type BookingValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { bookingsFormSchema, type BookingsFormInput, type BookingsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { BOOKING_PRIORITIES, BOOKING_PRIORITY_LABEL } from '@/shared/constant/trip'
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
} satisfies BookingInput

type BookingsFormProps = {
    defaultValues: BookingInput[]
    onSubmit: EditorSubmit<BookingValues[]>
    isPending: boolean
}

export const BookingsForm: FC<BookingsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
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
        <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()}>
            <EditorToolbar
                title='예매 체크리스트'
                description='우선순위 순서대로 정렬해 두면 뷰어에서 그대로 표시됩니다.'
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append(EMPTY_BOOKING)}>
                        <PlusIcon />
                        예매 추가
                    </Button>
                }
            />
            {rows.fields.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 예매 항목이 없습니다.</p>
            ) : (
                <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                    {rows.fields.map((row, index) => (
                        <SortableRow
                            key={row.fieldKey}
                            id={row.fieldKey}
                            index={index}
                            removeLabel='예매 항목 삭제'
                            onRemove={() => rows.remove(index)}>
                            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                <EditorField
                                    label='항목'
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
                                <EditorField label='시점' htmlFor={`booking-${index}-when`} error={itemErrors?.[index]?.whenLabel?.message}>
                                    <Input
                                        id={`booking-${index}-when`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='출발 2주 전'
                                        aria-invalid={!!itemErrors?.[index]?.whenLabel}
                                        {...form.register(`items.${index}.whenLabel`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField label='우선순위' htmlFor={`booking-${index}-priority`} error={itemErrors?.[index]?.priority?.message}>
                                    <NativeSelect
                                        id={`booking-${index}-priority`}
                                        className='w-full'
                                        size='sm'
                                        aria-invalid={!!itemErrors?.[index]?.priority}
                                        {...form.register(`items.${index}.priority`)}>
                                        {BOOKING_PRIORITIES.map((priority) => (
                                            <NativeSelectOption key={priority} value={priority}>
                                                {BOOKING_PRIORITY_LABEL[priority]}
                                            </NativeSelectOption>
                                        ))}
                                    </NativeSelect>
                                </EditorField>
                                <EditorField
                                    label='링크 이름'
                                    htmlFor={`booking-${index}-link-label`}
                                    error={itemErrors?.[index]?.linkLabel?.message}>
                                    <Input
                                        id={`booking-${index}-link-label`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='공식 예매처'
                                        aria-invalid={!!itemErrors?.[index]?.linkLabel}
                                        {...form.register(`items.${index}.linkLabel`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='링크 주소'
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
                                    label='할 일'
                                    htmlFor={`booking-${index}-action-note`}
                                    error={itemErrors?.[index]?.actionNote?.message}
                                    className='lg:col-span-2'>
                                    <Input
                                        id={`booking-${index}-action-note`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='오픈 시간에 맞춰 결제'
                                        aria-invalid={!!itemErrors?.[index]?.actionNote}
                                        {...form.register(`items.${index}.actionNote`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='진행 상태'
                                    htmlFor={`booking-${index}-plan-status`}
                                    error={itemErrors?.[index]?.planStatus?.message}
                                    className='lg:col-span-2'>
                                    <Input
                                        id={`booking-${index}-plan-status`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='예매 완료'
                                        aria-invalid={!!itemErrors?.[index]?.planStatus}
                                        {...form.register(`items.${index}.planStatus`, EMPTY_TO_NULL)}
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
