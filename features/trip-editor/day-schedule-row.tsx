'use client'
'use no memo'

import { ExternalLinkIcon } from 'lucide-react'
import { type FC } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { TripScheduleKind } from '@/entities/trip/trip.type'
import type { DayInput, DayValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_NULL } from '@/features/trip-editor/editor-form'
import { buildMapUrl } from '@/shared/constant/trip'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

type DayScheduleRowProps = {
    index: number
    kinds: readonly TripScheduleKind[]
}

export const DayScheduleRow: FC<DayScheduleRowProps> = ({ index, kinds }) => {
    const { control, register, formState } = useFormContext<DayInput, unknown, DayValues>()
    const [kindId, mapQuery] = useWatch({ control, name: [`scheduleItems.${index}.kindId`, `scheduleItems.${index}.mapQuery`] })

    const errors = formState.errors.scheduleItems?.[index]
    const fieldId = `schedule-${index}`
    const bufferPlaceholder = kinds.find((kind) => kind.id === kindId)?.bufferLabel ?? ''
    const mapUrl = mapQuery === null || mapQuery === undefined || mapQuery.trim() === '' ? null : buildMapUrl(mapQuery)

    return (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <EditorField label='시각' htmlFor={`${fieldId}-time`} error={errors?.timeLabel?.message}>
                <Input
                    id={`${fieldId}-time`}
                    className={`${EDITOR_INPUT_CLASS} font-mono`}
                    placeholder='09:30'
                    aria-invalid={!!errors?.timeLabel}
                    {...register(`scheduleItems.${index}.timeLabel`)}
                />
            </EditorField>
            <EditorField label='내용' htmlFor={`${fieldId}-title`} error={errors?.title?.message} className='lg:col-span-2'>
                <Input
                    id={`${fieldId}-title`}
                    className={EDITOR_INPUT_CLASS}
                    aria-invalid={!!errors?.title}
                    {...register(`scheduleItems.${index}.title`)}
                />
            </EditorField>
            <EditorField label='구분' htmlFor={`${fieldId}-kind`} error={errors?.kindId?.message}>
                <NativeSelect
                    id={`${fieldId}-kind`}
                    className='w-full'
                    size='sm'
                    aria-invalid={!!errors?.kindId}
                    {...register(`scheduleItems.${index}.kindId`)}>
                    {kinds.map((kind) => (
                        <NativeSelectOption key={kind.id} value={kind.id}>
                            {kind.label}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </EditorField>
            <EditorField label='메모' htmlFor={`${fieldId}-note`} error={errors?.note?.message} className='sm:col-span-2'>
                <Input
                    id={`${fieldId}-note`}
                    className={EDITOR_INPUT_CLASS}
                    aria-invalid={!!errors?.note}
                    {...register(`scheduleItems.${index}.note`, EMPTY_TO_NULL)}
                />
            </EditorField>
            <EditorField label='여유 문구' htmlFor={`${fieldId}-buffer`} error={errors?.bufferNote?.message}>
                <Input
                    id={`${fieldId}-buffer`}
                    className={EDITOR_INPUT_CLASS}
                    placeholder={bufferPlaceholder}
                    aria-invalid={!!errors?.bufferNote}
                    {...register(`scheduleItems.${index}.bufferNote`, EMPTY_TO_NULL)}
                />
            </EditorField>
            <EditorField label='지도 검색어' htmlFor={`${fieldId}-map-query`} error={errors?.mapQuery?.message}>
                <div className='flex items-center gap-1'>
                    <Input
                        id={`${fieldId}-map-query`}
                        className={EDITOR_INPUT_CLASS}
                        placeholder='난바역'
                        aria-invalid={!!errors?.mapQuery}
                        {...register(`scheduleItems.${index}.mapQuery`, EMPTY_TO_NULL)}
                    />
                    {mapUrl !== null && (
                        <Button className='shrink-0' variant='ghost' size='icon-sm' asChild>
                            <a href={mapUrl} target='_blank' rel='noopener noreferrer' aria-label='지도 미리보기' title='지도 미리보기'>
                                <ExternalLinkIcon />
                            </a>
                        </Button>
                    )}
                </div>
            </EditorField>
        </div>
    )
}
