'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { tripBasicsFormSchema, type TripBasicsFormInput, type TripBasicsFormValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import { EDITOR_GRID_CLASS, EDITOR_INPUT_CLASS, EDITOR_TEXTAREA_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { CountryCombobox } from '@/features/trips/country-combobox'
import { DEFAULT_COUNTRY_CODE } from '@/shared/constant/countries'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type BasicsFormProps = {
    defaultValues: TripBasicsFormInput
    onSubmit: EditorSubmit<TripBasicsFormValues>
    isPending: boolean
}

export const BasicsForm: FC<BasicsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const didResetRef = useRef(false)
    const form = useForm<TripBasicsFormInput, unknown, TripBasicsFormValues>({ resolver: zodResolver(tripBasicsFormSchema), defaultValues })
    const rows = useFieldArray({ control: form.control, name: 'destinations', keyName: 'fieldKey' })

    const { errors, isDirty } = form.formState
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit(values)
        if (isSaved) form.reset(values)
    })

    useEffect(() => {
        if (didResetRef.current) return
        didResetRef.current = true
        form.reset(defaultValues)
    }, [defaultValues, form])

    return (
        <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()}>
            <EditorPanel title='여행 개요' description='목록과 뷰어 상단에 표시되는 정보입니다.' contentClassName={EDITOR_GRID_CLASS}>
                <EditorField label='제목' htmlFor='basics-title' error={errors.title?.message}>
                    <Input id='basics-title' className={EDITOR_INPUT_CLASS} aria-invalid={!!errors.title} {...form.register('title')} />
                </EditorField>
                <EditorField label='윗줄 문구' htmlFor='basics-eyebrow' error={errors.eyebrow?.message}>
                    <Input
                        id='basics-eyebrow'
                        className={EDITOR_INPUT_CLASS}
                        placeholder='2박 3일 일정'
                        aria-invalid={!!errors.eyebrow}
                        {...form.register('eyebrow', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label='목적지' htmlFor='basics-destination' error={errors.destination?.message}>
                    <Input
                        id='basics-destination'
                        className={EDITOR_INPUT_CLASS}
                        aria-invalid={!!errors.destination}
                        {...form.register('destination')}
                    />
                </EditorField>
                <EditorField label='기간 문구' htmlFor='basics-period-note' error={errors.periodNote?.message}>
                    <Input
                        id='basics-period-note'
                        className={EDITOR_INPUT_CLASS}
                        placeholder='10.01 목 - 10.07 화'
                        aria-invalid={!!errors.periodNote}
                        {...form.register('periodNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label='시작일' htmlFor='basics-start-date' error={errors.startDate?.message}>
                    <Input
                        id='basics-start-date'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.startDate}
                        {...form.register('startDate')}
                    />
                </EditorField>
                <EditorField label='종료일' htmlFor='basics-end-date' error={errors.endDate?.message}>
                    <Input
                        id='basics-end-date'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.endDate}
                        {...form.register('endDate')}
                    />
                </EditorField>
                <EditorField
                    label='확인 기준일'
                    htmlFor='basics-verified-on'
                    error={errors.verifiedOn?.message}
                    hint='정보를 마지막으로 확인한 날짜입니다.'>
                    <Input
                        id='basics-verified-on'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.verifiedOn}
                        {...form.register('verifiedOn', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label='주의 문구' htmlFor='basics-disclaimer' error={errors.disclaimer?.message}>
                    <Input
                        id='basics-disclaimer'
                        className={EDITOR_INPUT_CLASS}
                        placeholder='운행 정보는 변동될 수 있습니다.'
                        aria-invalid={!!errors.disclaimer}
                        {...form.register('disclaimer', EMPTY_TO_NULL)}
                    />
                </EditorField>
            </EditorPanel>
            <EditorToolbar
                title='목적지'
                description='여행하는 순서대로 나라를 추가하세요. 항공편이 없으면 지구본 경로에 사용됩니다.'
                count={rows.fields.length}
                action={
                    <Button type='button' variant='outline' size='sm' onClick={() => rows.append({ countryCode: DEFAULT_COUNTRY_CODE, city: null })}>
                        <PlusIcon />
                        나라 추가
                    </Button>
                }
            />
            {rows.fields.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 목적지가 없습니다.</p>
            ) : (
                <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                    {rows.fields.map((row, index) => (
                        <SortableRow key={row.fieldKey} id={row.fieldKey} index={index} removeLabel='목적지 삭제' onRemove={() => rows.remove(index)}>
                            <div className={EDITOR_GRID_CLASS}>
                                <EditorField
                                    label='나라'
                                    htmlFor={`destination-${index}-country`}
                                    error={errors.destinations?.[index]?.countryCode?.message}>
                                    <Controller
                                        control={form.control}
                                        name={`destinations.${index}.countryCode`}
                                        render={({ field, fieldState }) => (
                                            <CountryCombobox
                                                id={`destination-${index}-country`}
                                                value={field.value}
                                                isInvalid={fieldState.invalid}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </EditorField>
                                <EditorField label='도시' htmlFor={`destination-${index}-city`} error={errors.destinations?.[index]?.city?.message}>
                                    <Input
                                        id={`destination-${index}-city`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='오사카'
                                        aria-invalid={!!errors.destinations?.[index]?.city}
                                        {...form.register(`destinations.${index}.city`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                            </div>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
            <EditorPanel title='안내 문구' description='뷰어의 범례·예매 소개·푸터에 그대로 표시됩니다.'>
                <EditorField label='여유 시간 안내' htmlFor='basics-buffer-policy' error={errors.bufferPolicy?.message}>
                    <Textarea
                        id='basics-buffer-policy'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.bufferPolicy}
                        {...form.register('bufferPolicy', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label='예매 안내' htmlFor='basics-booking-note' error={errors.bookingNote?.message}>
                    <Textarea
                        id='basics-booking-note'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.bookingNote}
                        {...form.register('bookingNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label='푸터 문구' htmlFor='basics-footer-note' error={errors.footerNote?.message}>
                    <Textarea
                        id='basics-footer-note'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.footerNote}
                        {...form.register('footerNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
            </EditorPanel>
        </EditorFormShell>
    )
}
