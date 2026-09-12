'use client'
'use no memo'

import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext, useWatch } from 'react-hook-form'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EDITOR_TEXTAREA_CLASS, EMPTY_TO_NULL } from '@/features/trip-editor/editor-form'
import type { InfoSectionsFormInput, InfoSectionsFormValues } from '@/features/trip-editor/editor-schema'
import { INFO_BLOCK_KINDS } from '@/shared/constant/trip'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { Textarea } from '@/shared/ui/textarea'

type InfoBlockRowProps = {
    sectionIndex: number
    blockIndex: number
}

export const InfoBlockRow: FC<InfoBlockRowProps> = ({ sectionIndex, blockIndex }) => {
    const t = useTranslations('tripEditor.infoBlock')
    const { control, register, formState } = useFormContext<InfoSectionsFormInput, unknown, InfoSectionsFormValues>()
    const kind = useWatch({ control, name: `items.${sectionIndex}.blocks.${blockIndex}.kind` })

    const errors = formState.errors.items?.[sectionIndex]?.blocks?.[blockIndex]
    const fieldId = `info-${sectionIndex}-block-${blockIndex}`
    const isDayTable = kind === 'day_table'

    return (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <EditorField label={t('kind')} htmlFor={`${fieldId}-kind`} error={errors?.kind?.message}>
                <NativeSelect
                    id={`${fieldId}-kind`}
                    className='w-full'
                    size='sm'
                    aria-invalid={!!errors?.kind}
                    {...register(`items.${sectionIndex}.blocks.${blockIndex}.kind`)}>
                    {INFO_BLOCK_KINDS.map((blockKind) => (
                        <NativeSelectOption key={blockKind} value={blockKind}>
                            {t(`kinds.${blockKind}`)}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </EditorField>
            {isDayTable ? (
                <p className='self-center text-xs text-muted-foreground sm:col-span-1 lg:col-span-3'>{t('dayTableHint')}</p>
            ) : (
                <>
                    <EditorField label={t('emphasis')} htmlFor={`${fieldId}-emphasis`} error={errors?.emphasis?.message} className='lg:col-span-3'>
                        <Input
                            id={`${fieldId}-emphasis`}
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors?.emphasis}
                            {...register(`items.${sectionIndex}.blocks.${blockIndex}.emphasis`, EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <EditorField label={t('body')} htmlFor={`${fieldId}-text`} error={errors?.text?.message} className='sm:col-span-2 lg:col-span-4'>
                        <Textarea
                            id={`${fieldId}-text`}
                            className={EDITOR_TEXTAREA_CLASS}
                            aria-invalid={!!errors?.text}
                            {...register(`items.${sectionIndex}.blocks.${blockIndex}.text`, EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <EditorField label={t('linkLabel')} htmlFor={`${fieldId}-link-label`} error={errors?.linkLabel?.message}>
                        <Input
                            id={`${fieldId}-link-label`}
                            className={EDITOR_INPUT_CLASS}
                            aria-invalid={!!errors?.linkLabel}
                            {...register(`items.${sectionIndex}.blocks.${blockIndex}.linkLabel`, EMPTY_TO_NULL)}
                        />
                    </EditorField>
                    <EditorField label={t('linkUrl')} htmlFor={`${fieldId}-link-url`} error={errors?.linkUrl?.message} className='lg:col-span-3'>
                        <Input
                            id={`${fieldId}-link-url`}
                            className={EDITOR_INPUT_CLASS}
                            type='url'
                            placeholder='https://'
                            aria-invalid={!!errors?.linkUrl}
                            {...register(`items.${sectionIndex}.blocks.${blockIndex}.linkUrl`, EMPTY_TO_NULL)}
                        />
                    </EditorField>
                </>
            )}
        </div>
    )
}
