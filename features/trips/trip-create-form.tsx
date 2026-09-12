'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { Controller, useFieldArray, useForm, type FieldError } from 'react-hook-form'
import { tripCreateSchema, type TripCreateInput, type TripCreateValues } from '@/entities/trip/trip.validate'
import { CountryCombobox } from '@/features/trips/country-combobox'
import { DEFAULT_COUNTRY_CODE } from '@/shared/constant/countries'
import { TRIP_DESTINATION_CITY_MAX_LENGTH, TRIP_DESTINATION_MIN_COUNT } from '@/shared/constant/trip'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError as FieldErrorMessage, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const CUSTOM_ISSUE_TYPE = 'custom'
const ROW_NUMBER_PAD = 2
const ROW_NUMBER_OFFSET = 1

const DEFAULT_VALUES: TripCreateInput = {
    title: '',
    destination: '',
    eyebrow: '',
    startDate: '',
    endDate: '',
    periodNote: '',
    destinations: [{ countryCode: DEFAULT_COUNTRY_CODE, city: null }],
}

const resolveMessage = (error: FieldError | undefined, fallback: string) => {
    if (!error) return null
    if (error.type === CUSTOM_ISSUE_TYPE && error.message) return error.message
    return fallback
}

const emptyToNull = (value: string | null | undefined) => (value === null || value === undefined || value.length === 0 ? null : value)

type TripCreateFormProps = {
    isPending: boolean
    onSubmit: (values: TripCreateValues) => void
}

export const TripCreateForm: FC<TripCreateFormProps> = ({ isPending, onSubmit }) => {
    const t = useTranslations('trips.create')
    const tValidation = useTranslations('validation')
    const form = useForm<TripCreateInput, unknown, TripCreateValues>({ resolver: zodResolver(tripCreateSchema), defaultValues: DEFAULT_VALUES })
    const rows = useFieldArray({ control: form.control, name: 'destinations', keyName: 'fieldKey' })

    const { errors } = form.formState
    const translateError = (message: string | null) =>
        message?.startsWith('validation.') ? tValidation(message.slice('validation.'.length)) : message
    const titleError = translateError(resolveMessage(errors.title, tValidation('tripTitleTooLong')))
    const destinationError = translateError(resolveMessage(errors.destination, tValidation('tripDestinationTooLong')))
    const eyebrowError = translateError(resolveMessage(errors.eyebrow, tValidation('tripEyebrowTooLong')))
    const startDateError = translateError(resolveMessage(errors.startDate, tValidation('tripStartDateRequired')))
    const endDateError = translateError(resolveMessage(errors.endDate, tValidation('tripEndDateRequired')))
    const periodNoteError = translateError(resolveMessage(errors.periodNote, tValidation('tripPeriodNoteTooLong')))
    const destinationsError = translateError(errors.destinations?.root?.message ?? errors.destinations?.message ?? null)

    const handleSubmit = form.handleSubmit((values) =>
        onSubmit({ ...values, eyebrow: emptyToNull(values.eyebrow), periodNote: emptyToNull(values.periodNote) }),
    )

    return (
        <form className='flex flex-col gap-4' noValidate onSubmit={handleSubmit}>
            <FieldGroup className='gap-4'>
                <Field data-invalid={titleError !== null}>
                    <FieldLabel htmlFor='trip-title'>{t('labels.title')}</FieldLabel>
                    <Input id='trip-title' aria-invalid={titleError !== null} placeholder={t('placeholders.title')} {...form.register('title')} />
                    <FieldErrorMessage>{titleError}</FieldErrorMessage>
                </Field>
                <Field data-invalid={destinationError !== null}>
                    <FieldLabel htmlFor='trip-destination'>{t('labels.destination')}</FieldLabel>
                    <Input
                        id='trip-destination'
                        aria-invalid={destinationError !== null}
                        placeholder={t('placeholders.destination')}
                        {...form.register('destination')}
                    />
                    <FieldErrorMessage>{destinationError}</FieldErrorMessage>
                </Field>
                <Field data-invalid={destinationsError !== null}>
                    <FieldLabel htmlFor='trip-country-0'>{t('labels.country')}</FieldLabel>
                    <FieldDescription className='text-xs'>{t('labels.countryHint')}</FieldDescription>
                    <div className='flex flex-col gap-2'>
                        {rows.fields.map((row, index) => (
                            <div key={row.fieldKey} className='flex items-center gap-2'>
                                <span className='w-5 shrink-0 font-mono text-xs text-muted-foreground tabular-nums'>
                                    {String(index + ROW_NUMBER_OFFSET).padStart(ROW_NUMBER_PAD, '0')}
                                </span>
                                <Controller
                                    control={form.control}
                                    name={`destinations.${index}.countryCode`}
                                    render={({ field, fieldState }) => (
                                        <CountryCombobox
                                            id={`trip-country-${index}`}
                                            className='min-w-0 flex-1'
                                            value={field.value}
                                            isInvalid={fieldState.invalid}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <Input
                                    aria-label={t('labels.city', { index: index + ROW_NUMBER_OFFSET })}
                                    className='min-w-0 flex-1'
                                    placeholder={t('labels.cityOptional')}
                                    maxLength={TRIP_DESTINATION_CITY_MAX_LENGTH}
                                    aria-invalid={errors.destinations?.[index]?.city !== undefined}
                                    {...form.register(`destinations.${index}.city`, { setValueAs: emptyToNull })}
                                />
                                <Button
                                    className='shrink-0'
                                    type='button'
                                    variant='ghost'
                                    size='icon-sm'
                                    aria-label={t('labels.removeCountry', { index: index + ROW_NUMBER_OFFSET })}
                                    disabled={rows.fields.length <= TRIP_DESTINATION_MIN_COUNT}
                                    onClick={() => rows.remove(index)}>
                                    <Trash2Icon aria-hidden />
                                </Button>
                            </div>
                        ))}
                        <div className='flex w-fit gap-px bg-background'>
                            <Button
                                type='button'
                                variant='cell'
                                size='cell'
                                onClick={() => rows.append({ countryCode: DEFAULT_COUNTRY_CODE, city: null })}>
                                <PlusIcon aria-hidden />
                                {t('labels.addCountry')}
                            </Button>
                        </div>
                    </div>
                    <FieldErrorMessage>{destinationsError}</FieldErrorMessage>
                </Field>
                <Field data-invalid={eyebrowError !== null}>
                    <FieldLabel htmlFor='trip-eyebrow'>{t('labels.eyebrow')}</FieldLabel>
                    <Input id='trip-eyebrow' aria-invalid={eyebrowError !== null} placeholder='KANSAI / OCTOBER 2026' {...form.register('eyebrow')} />
                    <FieldDescription className='text-xs'>{t('labels.eyebrowHint')}</FieldDescription>
                    <FieldErrorMessage>{eyebrowError}</FieldErrorMessage>
                </Field>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <Field data-invalid={startDateError !== null}>
                        <FieldLabel htmlFor='trip-start-date'>{t('labels.startDate')}</FieldLabel>
                        <Input id='trip-start-date' type='date' aria-invalid={startDateError !== null} {...form.register('startDate')} />
                        <FieldErrorMessage>{startDateError}</FieldErrorMessage>
                    </Field>
                    <Field data-invalid={endDateError !== null}>
                        <FieldLabel htmlFor='trip-end-date'>{t('labels.endDate')}</FieldLabel>
                        <Input id='trip-end-date' type='date' aria-invalid={endDateError !== null} {...form.register('endDate')} />
                        <FieldErrorMessage>{endDateError}</FieldErrorMessage>
                    </Field>
                </div>
                <Field data-invalid={periodNoteError !== null}>
                    <FieldLabel htmlFor='trip-period-note'>{t('labels.periodNote')}</FieldLabel>
                    <Input
                        id='trip-period-note'
                        aria-invalid={periodNoteError !== null}
                        placeholder={t('placeholders.periodNote')}
                        {...form.register('periodNote')}
                    />
                    <FieldErrorMessage>{periodNoteError}</FieldErrorMessage>
                </Field>
            </FieldGroup>
            <div className='flex w-fit gap-px self-end bg-background'>
                <Button type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? t('labels.submitting') : t('labels.submit')}
                </Button>
            </div>
        </form>
    )
}
