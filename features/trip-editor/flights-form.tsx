'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { type FlightInput, type FlightValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { AIRPORT_CODE_OPTION, EDITOR_INPUT_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { flightsFormSchema, type FlightsFormInput, type FlightsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { AIRPORTS } from '@/shared/constant/airports'
import { FLIGHT_DIRECTION_LABEL, FLIGHT_DIRECTIONS } from '@/shared/constant/trip'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const AIRPORT_DATALIST_ID = 'trip-editor-airport-codes'

const EMPTY_FLIGHT = {
    direction: 'outbound',
    label: '',
    departCode: '',
    departTime: '',
    departTerminal: null,
    arriveCode: '',
    arriveTime: '',
    arriveTerminal: null,
    flightNumber: null,
    note: null,
} satisfies FlightInput

type FlightsFormProps = {
    defaultValues: FlightInput[]
    onSubmit: EditorSubmit<FlightValues[]>
    isPending: boolean
}

export const FlightsForm: FC<FlightsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const didResetRef = useRef(false)
    const form = useForm<FlightsFormInput, unknown, FlightsFormValues>({
        resolver: zodResolver(flightsFormSchema),
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
                title='항공편'
                description='드래그해서 순서를 바꿀 수 있습니다.'
                count={rows.fields.length}
                action={
                    <Button type='button' variant='outline' size='sm' onClick={() => rows.append(EMPTY_FLIGHT)}>
                        <PlusIcon />
                        항공편 추가
                    </Button>
                }
            />
            {rows.fields.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 항공편이 없습니다.</p>
            ) : (
                <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                    {rows.fields.map((row, index) => (
                        <SortableRow key={row.fieldKey} id={row.fieldKey} index={index} removeLabel='항공편 삭제' onRemove={() => rows.remove(index)}>
                            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                <EditorField label='구분' htmlFor={`flight-${index}-direction`} error={itemErrors?.[index]?.direction?.message}>
                                    <NativeSelect
                                        id={`flight-${index}-direction`}
                                        className='w-full'
                                        size='sm'
                                        aria-invalid={!!itemErrors?.[index]?.direction}
                                        {...form.register(`items.${index}.direction`)}>
                                        {FLIGHT_DIRECTIONS.map((direction) => (
                                            <NativeSelectOption key={direction} value={direction}>
                                                {FLIGHT_DIRECTION_LABEL[direction]}
                                            </NativeSelectOption>
                                        ))}
                                    </NativeSelect>
                                </EditorField>
                                <EditorField
                                    label='라벨'
                                    htmlFor={`flight-${index}-label`}
                                    error={itemErrors?.[index]?.label?.message}
                                    className='lg:col-span-3'>
                                    <Input
                                        id={`flight-${index}-label`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='10.01 목 · 출국'
                                        aria-invalid={!!itemErrors?.[index]?.label}
                                        {...form.register(`items.${index}.label`)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='출발 공항'
                                    htmlFor={`flight-${index}-depart-code`}
                                    error={itemErrors?.[index]?.departCode?.message}>
                                    <Input
                                        id={`flight-${index}-depart-code`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono uppercase`}
                                        list={AIRPORT_DATALIST_ID}
                                        placeholder='ICN'
                                        aria-invalid={!!itemErrors?.[index]?.departCode}
                                        {...form.register(`items.${index}.departCode`, AIRPORT_CODE_OPTION)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='출발 시각'
                                    htmlFor={`flight-${index}-depart-time`}
                                    error={itemErrors?.[index]?.departTime?.message}>
                                    <Input
                                        id={`flight-${index}-depart-time`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono`}
                                        placeholder='16:10'
                                        aria-invalid={!!itemErrors?.[index]?.departTime}
                                        {...form.register(`items.${index}.departTime`)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='출발 터미널'
                                    htmlFor={`flight-${index}-depart-terminal`}
                                    error={itemErrors?.[index]?.departTerminal?.message}>
                                    <Input
                                        id={`flight-${index}-depart-terminal`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='제1여객터미널'
                                        aria-invalid={!!itemErrors?.[index]?.departTerminal}
                                        {...form.register(`items.${index}.departTerminal`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField label='편명' htmlFor={`flight-${index}-number`} error={itemErrors?.[index]?.flightNumber?.message}>
                                    <Input
                                        id={`flight-${index}-number`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono`}
                                        placeholder='KE723'
                                        aria-invalid={!!itemErrors?.[index]?.flightNumber}
                                        {...form.register(`items.${index}.flightNumber`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='도착 공항'
                                    htmlFor={`flight-${index}-arrive-code`}
                                    error={itemErrors?.[index]?.arriveCode?.message}>
                                    <Input
                                        id={`flight-${index}-arrive-code`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono uppercase`}
                                        list={AIRPORT_DATALIST_ID}
                                        placeholder='KIX'
                                        aria-invalid={!!itemErrors?.[index]?.arriveCode}
                                        {...form.register(`items.${index}.arriveCode`, AIRPORT_CODE_OPTION)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='도착 시각'
                                    htmlFor={`flight-${index}-arrive-time`}
                                    error={itemErrors?.[index]?.arriveTime?.message}>
                                    <Input
                                        id={`flight-${index}-arrive-time`}
                                        className={`${EDITOR_INPUT_CLASS} font-mono`}
                                        placeholder='17:55'
                                        aria-invalid={!!itemErrors?.[index]?.arriveTime}
                                        {...form.register(`items.${index}.arriveTime`)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='도착 터미널'
                                    htmlFor={`flight-${index}-arrive-terminal`}
                                    error={itemErrors?.[index]?.arriveTerminal?.message}>
                                    <Input
                                        id={`flight-${index}-arrive-terminal`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='제1터미널'
                                        aria-invalid={!!itemErrors?.[index]?.arriveTerminal}
                                        {...form.register(`items.${index}.arriveTerminal`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='메모'
                                    htmlFor={`flight-${index}-note`}
                                    error={itemErrors?.[index]?.note?.message}
                                    className='sm:col-span-2 lg:col-span-4'>
                                    <Input
                                        id={`flight-${index}-note`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder='탑승 수속 마감 시각 등'
                                        aria-invalid={!!itemErrors?.[index]?.note}
                                        {...form.register(`items.${index}.note`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                            </div>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
            <datalist id={AIRPORT_DATALIST_ID}>
                {Object.entries(AIRPORTS).map(([code, airport]) => (
                    <option key={code} value={code}>
                        {`${airport.city} ${airport.name}`}
                    </option>
                ))}
            </datalist>
        </EditorFormShell>
    )
}
