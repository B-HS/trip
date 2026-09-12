'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, type FC } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { tripBasicsFormSchema, type TripBasicsFormInput, type TripBasicsFormValues } from '@/entities/trip/trip.validate'
import { AirportCombobox } from '@/features/trip-editor/airport-combobox'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import {
    EDITOR_GRID_CLASS,
    EDITOR_INPUT_CLASS,
    EDITOR_TEXTAREA_CLASS,
    EMPTY_TO_NULL,
    EMPTY_TO_NULL_NUMBER,
    type EditorSubmit,
} from '@/features/trip-editor/editor-form'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { CountryCombobox } from '@/features/trips/country-combobox'
import { DEFAULT_COUNTRY_CODE } from '@/shared/constant/countries'
import { TRIP_LENGTH_MAX, TRIP_LENGTH_MIN } from '@/shared/constant/trip'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type BasicsFormProps = {
    defaultValues: TripBasicsFormInput
    onSubmit: EditorSubmit<TripBasicsFormValues>
    isPending: boolean
}

export const BasicsForm: FC<BasicsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const t = useTranslations('tripEditor.basics')
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
            <EditorPanel title={t('overviewTitle')} description={t('overviewDescription')} contentClassName={EDITOR_GRID_CLASS}>
                <EditorField label={t('title')} htmlFor='basics-title' error={errors.title?.message}>
                    <Input id='basics-title' className={EDITOR_INPUT_CLASS} aria-invalid={!!errors.title} {...form.register('title')} />
                </EditorField>
                <EditorField label={t('eyebrow')} htmlFor='basics-eyebrow' error={errors.eyebrow?.message}>
                    <Input
                        id='basics-eyebrow'
                        className={EDITOR_INPUT_CLASS}
                        placeholder={t('eyebrowPlaceholder')}
                        aria-invalid={!!errors.eyebrow}
                        {...form.register('eyebrow', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label={t('destination')} htmlFor='basics-destination' error={errors.destination?.message}>
                    <Input
                        id='basics-destination'
                        className={EDITOR_INPUT_CLASS}
                        aria-invalid={!!errors.destination}
                        {...form.register('destination')}
                    />
                </EditorField>
                <EditorField
                    label={t('departureAirport')}
                    htmlFor='basics-departure-airport'
                    error={errors.departureAirportCode?.message}
                    hint={t('departureAirportHint')}>
                    <Controller
                        control={form.control}
                        name='departureAirportCode'
                        render={({ field, fieldState }) => (
                            <AirportCombobox
                                id='basics-departure-airport'
                                className={EDITOR_INPUT_CLASS}
                                value={field.value ?? null}
                                isInvalid={fieldState.invalid}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </EditorField>
                <EditorField label={t('periodNote')} htmlFor='basics-period-note' error={errors.periodNote?.message}>
                    <Input
                        id='basics-period-note'
                        className={EDITOR_INPUT_CLASS}
                        placeholder={t('periodNotePlaceholder')}
                        aria-invalid={!!errors.periodNote}
                        {...form.register('periodNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label={t('startDate')} htmlFor='basics-start-date' error={errors.startDate?.message}>
                    <Input
                        id='basics-start-date'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.startDate}
                        {...form.register('startDate')}
                    />
                </EditorField>
                <EditorField label={t('endDate')} htmlFor='basics-end-date' error={errors.endDate?.message}>
                    <Input
                        id='basics-end-date'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.endDate}
                        {...form.register('endDate')}
                    />
                </EditorField>
                <EditorField label={t('nights')} htmlFor='basics-nights' error={errors.customNights?.message}>
                    <Input
                        id='basics-nights'
                        className={EDITOR_INPUT_CLASS}
                        type='number'
                        inputMode='numeric'
                        min={TRIP_LENGTH_MIN}
                        max={TRIP_LENGTH_MAX}
                        aria-invalid={!!errors.customNights}
                        {...form.register('customNights', EMPTY_TO_NULL_NUMBER)}
                    />
                </EditorField>
                <EditorField label={t('days')} htmlFor='basics-days' error={errors.customDays?.message} hint={t('autoLengthHint')}>
                    <Input
                        id='basics-days'
                        className={EDITOR_INPUT_CLASS}
                        type='number'
                        inputMode='numeric'
                        min={TRIP_LENGTH_MIN}
                        max={TRIP_LENGTH_MAX}
                        aria-invalid={!!errors.customDays}
                        {...form.register('customDays', EMPTY_TO_NULL_NUMBER)}
                    />
                </EditorField>
                <EditorField label={t('verifiedOn')} htmlFor='basics-verified-on' error={errors.verifiedOn?.message} hint={t('verifiedOnHint')}>
                    <Input
                        id='basics-verified-on'
                        className={EDITOR_INPUT_CLASS}
                        type='date'
                        aria-invalid={!!errors.verifiedOn}
                        {...form.register('verifiedOn', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label={t('disclaimer')} htmlFor='basics-disclaimer' error={errors.disclaimer?.message}>
                    <Input
                        id='basics-disclaimer'
                        className={EDITOR_INPUT_CLASS}
                        placeholder={t('disclaimerPlaceholder')}
                        aria-invalid={!!errors.disclaimer}
                        {...form.register('disclaimer', EMPTY_TO_NULL)}
                    />
                </EditorField>
            </EditorPanel>
            <EditorToolbar
                title={t('destinationsTitle')}
                description={t('destinationsDescription')}
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append({ countryCode: DEFAULT_COUNTRY_CODE, city: null })}>
                        <PlusIcon />
                        {t('addCountry')}
                    </Button>
                }
            />
            {rows.fields.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>{t('destinationsEmpty')}</p>
            ) : (
                <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                    {rows.fields.map((row, index) => (
                        <SortableRow
                            key={row.fieldKey}
                            id={row.fieldKey}
                            index={index}
                            removeLabel={t('removeDestination')}
                            onRemove={() => rows.remove(index)}>
                            <div className={EDITOR_GRID_CLASS}>
                                <EditorField
                                    label={t('country')}
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
                                <EditorField
                                    label={t('city')}
                                    htmlFor={`destination-${index}-city`}
                                    error={errors.destinations?.[index]?.city?.message}>
                                    <Input
                                        id={`destination-${index}-city`}
                                        className={EDITOR_INPUT_CLASS}
                                        placeholder={t('cityPlaceholder')}
                                        aria-invalid={!!errors.destinations?.[index]?.city}
                                        {...form.register(`destinations.${index}.city`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                            </div>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
            <EditorPanel title={t('noticesTitle')} description={t('noticesDescription')}>
                <EditorField label={t('bufferPolicy')} htmlFor='basics-buffer-policy' error={errors.bufferPolicy?.message}>
                    <Textarea
                        id='basics-buffer-policy'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.bufferPolicy}
                        {...form.register('bufferPolicy', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label={t('bookingNote')} htmlFor='basics-booking-note' error={errors.bookingNote?.message}>
                    <Textarea
                        id='basics-booking-note'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.bookingNote}
                        {...form.register('bookingNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
                <EditorField label={t('footerNote')} htmlFor='basics-footer-note' error={errors.footerNote?.message}>
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
