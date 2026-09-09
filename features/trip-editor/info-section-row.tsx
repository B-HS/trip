'use client'

import { PlusIcon } from 'lucide-react'
import { type FC } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS } from '@/features/trip-editor/editor-form'
import type { InfoBlockInput, InfoSectionsFormInput, InfoSectionsFormValues } from '@/features/trip-editor/editor-schema'
import { InfoBlockRow } from '@/features/trip-editor/info-block-row'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const EMPTY_BLOCK = { kind: 'paragraph', emphasis: null, text: null, linkLabel: null, linkUrl: null } satisfies InfoBlockInput

type InfoSectionRowProps = {
    sectionIndex: number
}

export const InfoSectionRow: FC<InfoSectionRowProps> = ({ sectionIndex }) => {
    const { control, register, formState } = useFormContext<InfoSectionsFormInput, unknown, InfoSectionsFormValues>()
    const blocks = useFieldArray({ control, name: `items.${sectionIndex}.blocks`, keyName: 'fieldKey' })

    const errors = formState.errors.items?.[sectionIndex]
    const fieldId = `info-${sectionIndex}`

    return (
        <div className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-end gap-3'>
                <EditorField label='섹션 제목' htmlFor={`${fieldId}-title`} error={errors?.title?.message} className='min-w-48 flex-1'>
                    <Input
                        id={`${fieldId}-title`}
                        className={EDITOR_INPUT_CLASS}
                        aria-invalid={!!errors?.title}
                        {...register(`items.${sectionIndex}.title`)}
                    />
                </EditorField>
                <div className='flex h-8 items-center gap-2'>
                    <Controller
                        control={control}
                        name={`items.${sectionIndex}.isDefaultOpen`}
                        render={({ field }) => (
                            <Switch id={`${fieldId}-default-open`} checked={field.value ?? false} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label className='text-xs font-medium text-muted-foreground' htmlFor={`${fieldId}-default-open`}>
                        기본 펼침
                    </Label>
                </div>
                <Button type='button' variant='outline' size='sm' onClick={() => blocks.append(EMPTY_BLOCK)}>
                    <PlusIcon />
                    블록 추가
                </Button>
            </div>
            {blocks.fields.length === 0 ? (
                <p className='text-xs text-muted-foreground'>블록이 없습니다.</p>
            ) : (
                <SortableRows ids={blocks.fields.map((block) => block.fieldKey)} onReorder={blocks.move}>
                    {blocks.fields.map((block, blockIndex) => (
                        <SortableRow
                            key={block.fieldKey}
                            id={block.fieldKey}
                            index={blockIndex}
                            removeLabel='블록 삭제'
                            onRemove={() => blocks.remove(blockIndex)}>
                            <InfoBlockRow sectionIndex={sectionIndex} blockIndex={blockIndex} />
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
        </div>
    )
}
