'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { FC } from 'react'
import { useForm, type FieldError } from 'react-hook-form'
import { tripBasicsSchema, type TripBasicsInput, type TripBasicsValues } from '@/entities/trip/trip.validate'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError as FieldErrorMessage, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const CUSTOM_ISSUE_TYPE = 'custom'

const DEFAULT_VALUES: TripBasicsInput = {
    title: '',
    destination: '',
    eyebrow: '',
    startDate: '',
    endDate: '',
    periodNote: '',
}

const MESSAGE = {
    title: '제목을 120자 이내로 입력해 주세요.',
    destination: '목적지를 120자 이내로 입력해 주세요.',
    eyebrow: '한 줄 소개는 120자 이내로 입력해 주세요.',
    startDate: '시작일을 선택해 주세요.',
    endDate: '종료일을 선택해 주세요.',
    periodNote: '기간 메모는 200자 이내로 입력해 주세요.',
} as const

const resolveMessage = (error: FieldError | undefined, fallback: string) => {
    if (!error) return null
    if (error.type === CUSTOM_ISSUE_TYPE && error.message) return error.message
    return fallback
}

const emptyToNull = (value: string | null | undefined) => (value === null || value === undefined || value.length === 0 ? null : value)

type TripCreateFormProps = {
    isPending: boolean
    onSubmit: (values: TripBasicsValues) => void
}

export const TripCreateForm: FC<TripCreateFormProps> = ({ isPending, onSubmit }) => {
    const form = useForm<TripBasicsInput, unknown, TripBasicsValues>({ resolver: zodResolver(tripBasicsSchema), defaultValues: DEFAULT_VALUES })
    const { errors } = form.formState
    const titleError = resolveMessage(errors.title, MESSAGE.title)
    const destinationError = resolveMessage(errors.destination, MESSAGE.destination)
    const eyebrowError = resolveMessage(errors.eyebrow, MESSAGE.eyebrow)
    const startDateError = resolveMessage(errors.startDate, MESSAGE.startDate)
    const endDateError = resolveMessage(errors.endDate, MESSAGE.endDate)
    const periodNoteError = resolveMessage(errors.periodNote, MESSAGE.periodNote)

    const handleSubmit = form.handleSubmit((values) =>
        onSubmit({ ...values, eyebrow: emptyToNull(values.eyebrow), periodNote: emptyToNull(values.periodNote) }),
    )

    return (
        <form className='flex flex-col gap-4' noValidate onSubmit={handleSubmit}>
            <FieldGroup className='gap-4'>
                <Field data-invalid={titleError !== null}>
                    <FieldLabel htmlFor='trip-title'>제목</FieldLabel>
                    <Input id='trip-title' aria-invalid={titleError !== null} placeholder='오사카 여행 노트' {...form.register('title')} />
                    <FieldErrorMessage>{titleError}</FieldErrorMessage>
                </Field>
                <Field data-invalid={destinationError !== null}>
                    <FieldLabel htmlFor='trip-destination'>목적지</FieldLabel>
                    <Input id='trip-destination' aria-invalid={destinationError !== null} placeholder='오사카' {...form.register('destination')} />
                    <FieldErrorMessage>{destinationError}</FieldErrorMessage>
                </Field>
                <Field data-invalid={eyebrowError !== null}>
                    <FieldLabel htmlFor='trip-eyebrow'>한 줄 소개</FieldLabel>
                    <Input id='trip-eyebrow' aria-invalid={eyebrowError !== null} placeholder='KANSAI / OCTOBER 2026' {...form.register('eyebrow')} />
                    <FieldDescription className='text-xs'>목록과 상세 화면의 제목 위에 표시됩니다. 비워 둬도 됩니다.</FieldDescription>
                    <FieldErrorMessage>{eyebrowError}</FieldErrorMessage>
                </Field>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <Field data-invalid={startDateError !== null}>
                        <FieldLabel htmlFor='trip-start-date'>시작일</FieldLabel>
                        <Input id='trip-start-date' type='date' aria-invalid={startDateError !== null} {...form.register('startDate')} />
                        <FieldErrorMessage>{startDateError}</FieldErrorMessage>
                    </Field>
                    <Field data-invalid={endDateError !== null}>
                        <FieldLabel htmlFor='trip-end-date'>종료일</FieldLabel>
                        <Input id='trip-end-date' type='date' aria-invalid={endDateError !== null} {...form.register('endDate')} />
                        <FieldErrorMessage>{endDateError}</FieldErrorMessage>
                    </Field>
                </div>
                <Field data-invalid={periodNoteError !== null}>
                    <FieldLabel htmlFor='trip-period-note'>기간 메모</FieldLabel>
                    <Input
                        id='trip-period-note'
                        aria-invalid={periodNoteError !== null}
                        placeholder='6박 7일 · 예비일 하루'
                        {...form.register('periodNote')}
                    />
                    <FieldErrorMessage>{periodNoteError}</FieldErrorMessage>
                </Field>
            </FieldGroup>
            <div className='flex justify-end'>
                <Button type='submit' size='sm' disabled={isPending}>
                    {isPending ? '만드는 중…' : '트립 만들기'}
                </Button>
            </div>
        </form>
    )
}
