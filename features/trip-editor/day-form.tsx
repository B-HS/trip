'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { dayInputSchema, type DayInput, type DayValues } from '@/entities/trip/trip.validate'
import { DayScheduleRow } from '@/features/trip-editor/day-schedule-row'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_GRID_CLASS, EDITOR_INPUT_CLASS, EDITOR_TEXTAREA_CLASS, EMPTY_TO_NULL } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import type { DayFactInput, DayNoteInput, RouteInput, ScheduleItemInput } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const EMPTY_FACT = { label: '', value: '' } satisfies DayFactInput
const EMPTY_ROUTE = { origin: '', destination: '', minutes: 0, pathText: null, formula: null } satisfies RouteInput
const EMPTY_SCHEDULE = { timeLabel: '', title: '', kind: 'planned', note: null, bufferNote: null, mapQuery: null } satisfies ScheduleItemInput
const EMPTY_NOTE = { leading: null, linkLabel: null, linkUrl: null, trailing: null } satisfies DayNoteInput

type DayFormProps = {
    heading: string
    defaultValues: DayInput
    onSubmit: (values: DayValues) => Promise<string | null>
    isPending: boolean
}

export const DayForm: FC<DayFormProps> = ({ heading, defaultValues, onSubmit, isPending }) => {
    const didResetRef = useRef(false)
    const form = useForm<DayInput, unknown, DayValues>({ resolver: zodResolver(dayInputSchema), defaultValues })
    const facts = useFieldArray({ control: form.control, name: 'facts', keyName: 'fieldKey' })
    const routes = useFieldArray({ control: form.control, name: 'routes', keyName: 'fieldKey' })
    const scheduleItems = useFieldArray({ control: form.control, name: 'scheduleItems', keyName: 'fieldKey' })
    const notes = useFieldArray({ control: form.control, name: 'notes', keyName: 'fieldKey' })

    const { errors, isDirty } = form.formState
    const handleSubmit = form.handleSubmit(async (values) => {
        const savedDayId = await onSubmit(values)
        if (savedDayId !== null) form.reset({ ...values, id: savedDayId })
    })

    useEffect(() => {
        if (didResetRef.current) return
        didResetRef.current = true
        form.reset(defaultValues)
    }, [defaultValues, form])

    return (
        <FormProvider {...form}>
            <EditorFormShell
                isDirty={isDirty}
                isPending={isPending}
                onSubmit={handleSubmit}
                onReset={() => form.reset()}
                hint='이 날짜만 저장합니다.'>
                <EditorPanel title={heading} description='날짜 탭과 헤딩에 사용하는 값입니다.' contentClassName={EDITOR_GRID_CLASS}>
                    <EditorField label='날짜' htmlFor='day-date' error={errors.date?.message}>
                        <Input id='day-date' className={EDITOR_INPUT_CLASS} type='date' aria-invalid={!!errors.date} {...form.register('date')} />
                    </EditorField>
                    <EditorField label='탭 라벨' htmlFor='day-short-label' error={errors.shortLabel?.message}>
                        <Input
                            id='day-short-label'
                            className={`${EDITOR_INPUT_CLASS} font-mono`}
                            placeholder='10.01'
                            aria-invalid={!!errors.shortLabel}
                            {...form.register('shortLabel')}
                        />
                    </EditorField>
                    <EditorField label='제목' htmlFor='day-title' error={errors.title?.message}>
                        <Input id='day-title' className={EDITOR_INPUT_CLASS} aria-invalid={!!errors.title} {...form.register('title')} />
                    </EditorField>
                    <EditorField label='부제' htmlFor='day-subtitle' error={errors.subtitle?.message}>
                        <Input
                            id='day-subtitle'
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors.subtitle}
                            {...form.register('subtitle', EMPTY_TO_NULL)}
                        />
                    </EditorField>
                </EditorPanel>
                <EditorPanel title='본문' description='개요, 이동 계획, 마무리 문단입니다.'>
                    <EditorField label='개요' htmlFor='day-overview' error={errors.overview?.message}>
                        <Textarea
                            id='day-overview'
                            className={EDITOR_TEXTAREA_CLASS}
                            aria-invalid={!!errors.overview}
                            {...form.register('overview', EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <div className={EDITOR_GRID_CLASS}>
                        <EditorField label='이동 계획 제목' htmlFor='day-plan-headline' error={errors.planHeadline?.message}>
                            <Input
                                id='day-plan-headline'
                                className={EDITOR_INPUT_CLASS}
                                aria-invalid={!!errors.planHeadline}
                                {...form.register('planHeadline', EMPTY_TO_NULL)}
                            />
                        </EditorField>
                        <EditorField label='마무리 제목' htmlFor='day-closing-headline' error={errors.closingHeadline?.message}>
                            <Input
                                id='day-closing-headline'
                                className={EDITOR_INPUT_CLASS}
                                aria-invalid={!!errors.closingHeadline}
                                {...form.register('closingHeadline', EMPTY_TO_NULL)}
                            />
                        </EditorField>
                        <EditorField label='이동 계획 본문' htmlFor='day-plan-note' error={errors.planNote?.message}>
                            <Textarea
                                id='day-plan-note'
                                className={EDITOR_TEXTAREA_CLASS}
                                aria-invalid={!!errors.planNote}
                                {...form.register('planNote', EMPTY_TO_NULL)}
                            />
                        </EditorField>
                        <EditorField label='마무리 본문' htmlFor='day-closing-note' error={errors.closingNote?.message}>
                            <Textarea
                                id='day-closing-note'
                                className={EDITOR_TEXTAREA_CLASS}
                                aria-invalid={!!errors.closingNote}
                                {...form.register('closingNote', EMPTY_TO_NULL)}
                            />
                        </EditorField>
                    </div>
                </EditorPanel>
                <EditorPanel title='전체 일정 표' description='여행 정보의 전체 일정 표에 들어가는 요약입니다.' contentClassName={EDITOR_GRID_CLASS}>
                    <EditorField label='오전' htmlFor='day-morning' error={errors.morningSummary?.message}>
                        <Input
                            id='day-morning'
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors.morningSummary}
                            {...form.register('morningSummary', EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <EditorField label='오후' htmlFor='day-afternoon' error={errors.afternoonSummary?.message}>
                        <Input
                            id='day-afternoon'
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors.afternoonSummary}
                            {...form.register('afternoonSummary', EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <EditorField label='저녁' htmlFor='day-evening' error={errors.eveningSummary?.message}>
                        <Input
                            id='day-evening'
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors.eveningSummary}
                            {...form.register('eveningSummary', EMPTY_TO_NULL)}
                        />
                    </EditorField>
                </EditorPanel>
                <EditorToolbar
                    title='확인된 내용'
                    count={facts.fields.length}
                    action={
                        <Button type='button' variant='outline' size='sm' onClick={() => facts.append(EMPTY_FACT)}>
                            <PlusIcon />
                            항목 추가
                        </Button>
                    }
                />
                {facts.fields.length > 0 && (
                    <SortableRows ids={facts.fields.map((row) => row.fieldKey)} onReorder={facts.move}>
                        {facts.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel='항목 삭제'
                                onRemove={() => facts.remove(index)}>
                                <div className={EDITOR_GRID_CLASS}>
                                    <EditorField label='항목' htmlFor={`fact-${index}-label`} error={errors.facts?.[index]?.label?.message}>
                                        <Input
                                            id={`fact-${index}-label`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.facts?.[index]?.label}
                                            {...form.register(`facts.${index}.label`)}
                                        />
                                    </EditorField>
                                    <EditorField label='내용' htmlFor={`fact-${index}-value`} error={errors.facts?.[index]?.value?.message}>
                                        <Input
                                            id={`fact-${index}-value`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.facts?.[index]?.value}
                                            {...form.register(`facts.${index}.value`)}
                                        />
                                    </EditorField>
                                </div>
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
                <EditorToolbar
                    title='이동 경로'
                    count={routes.fields.length}
                    action={
                        <Button type='button' variant='outline' size='sm' onClick={() => routes.append(EMPTY_ROUTE)}>
                            <PlusIcon />
                            경로 추가
                        </Button>
                    }
                />
                {routes.fields.length > 0 && (
                    <SortableRows ids={routes.fields.map((row) => row.fieldKey)} onReorder={routes.move}>
                        {routes.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel='경로 삭제'
                                onRemove={() => routes.remove(index)}>
                                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                    <EditorField label='출발' htmlFor={`route-${index}-origin`} error={errors.routes?.[index]?.origin?.message}>
                                        <Input
                                            id={`route-${index}-origin`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.routes?.[index]?.origin}
                                            {...form.register(`routes.${index}.origin`)}
                                        />
                                    </EditorField>
                                    <EditorField
                                        label='도착'
                                        htmlFor={`route-${index}-destination`}
                                        error={errors.routes?.[index]?.destination?.message}>
                                        <Input
                                            id={`route-${index}-destination`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.routes?.[index]?.destination}
                                            {...form.register(`routes.${index}.destination`)}
                                        />
                                    </EditorField>
                                    <EditorField label='소요(분)' htmlFor={`route-${index}-minutes`} error={errors.routes?.[index]?.minutes?.message}>
                                        <Input
                                            id={`route-${index}-minutes`}
                                            className={`${EDITOR_INPUT_CLASS} font-mono tabular-nums`}
                                            type='number'
                                            min={0}
                                            aria-invalid={!!errors.routes?.[index]?.minutes}
                                            {...form.register(`routes.${index}.minutes`, { valueAsNumber: true })}
                                        />
                                    </EditorField>
                                    <EditorField label='계산식' htmlFor={`route-${index}-formula`} error={errors.routes?.[index]?.formula?.message}>
                                        <Input
                                            id={`route-${index}-formula`}
                                            className={EDITOR_INPUT_CLASS}
                                            placeholder='도보 8 + 지하철 12'
                                            aria-invalid={!!errors.routes?.[index]?.formula}
                                            {...form.register(`routes.${index}.formula`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                    <EditorField
                                        label='경로 설명'
                                        htmlFor={`route-${index}-path-text`}
                                        error={errors.routes?.[index]?.pathText?.message}
                                        className='sm:col-span-2 lg:col-span-4'>
                                        <Input
                                            id={`route-${index}-path-text`}
                                            className={EDITOR_INPUT_CLASS}
                                            placeholder='난바역 → 미도스지선 → 우메다역'
                                            aria-invalid={!!errors.routes?.[index]?.pathText}
                                            {...form.register(`routes.${index}.pathText`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                </div>
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
                <EditorToolbar
                    title='타임라인'
                    count={scheduleItems.fields.length}
                    action={
                        <Button type='button' variant='outline' size='sm' onClick={() => scheduleItems.append(EMPTY_SCHEDULE)}>
                            <PlusIcon />
                            일정 추가
                        </Button>
                    }
                />
                {scheduleItems.fields.length > 0 && (
                    <SortableRows ids={scheduleItems.fields.map((row) => row.fieldKey)} onReorder={scheduleItems.move}>
                        {scheduleItems.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel='일정 삭제'
                                onRemove={() => scheduleItems.remove(index)}>
                                <DayScheduleRow index={index} />
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
                <EditorToolbar
                    title='참고'
                    count={notes.fields.length}
                    action={
                        <Button type='button' variant='outline' size='sm' onClick={() => notes.append(EMPTY_NOTE)}>
                            <PlusIcon />
                            참고 추가
                        </Button>
                    }
                />
                {notes.fields.length > 0 && (
                    <SortableRows ids={notes.fields.map((row) => row.fieldKey)} onReorder={notes.move}>
                        {notes.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel='참고 삭제'
                                onRemove={() => notes.remove(index)}>
                                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                    <EditorField
                                        label='앞 문장'
                                        htmlFor={`note-${index}-leading`}
                                        error={errors.notes?.[index]?.leading?.message}
                                        className='sm:col-span-2'>
                                        <Input
                                            id={`note-${index}-leading`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.notes?.[index]?.leading}
                                            {...form.register(`notes.${index}.leading`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                    <EditorField
                                        label='링크 이름'
                                        htmlFor={`note-${index}-link-label`}
                                        error={errors.notes?.[index]?.linkLabel?.message}>
                                        <Input
                                            id={`note-${index}-link-label`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.notes?.[index]?.linkLabel}
                                            {...form.register(`notes.${index}.linkLabel`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                    <EditorField label='링크 주소' htmlFor={`note-${index}-link-url`} error={errors.notes?.[index]?.linkUrl?.message}>
                                        <Input
                                            id={`note-${index}-link-url`}
                                            className={EDITOR_INPUT_CLASS}
                                            type='url'
                                            placeholder='https://'
                                            aria-invalid={!!errors.notes?.[index]?.linkUrl}
                                            {...form.register(`notes.${index}.linkUrl`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                    <EditorField
                                        label='뒤 문장'
                                        htmlFor={`note-${index}-trailing`}
                                        error={errors.notes?.[index]?.trailing?.message}
                                        className='sm:col-span-2 lg:col-span-4'>
                                        <Input
                                            id={`note-${index}-trailing`}
                                            className={EDITOR_INPUT_CLASS}
                                            aria-invalid={!!errors.notes?.[index]?.trailing}
                                            {...form.register(`notes.${index}.trailing`, EMPTY_TO_NULL)}
                                        />
                                    </EditorField>
                                </div>
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
            </EditorFormShell>
        </FormProvider>
    )
}
