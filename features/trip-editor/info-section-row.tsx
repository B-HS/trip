'use client'
'use no memo'

import { PlusIcon, Trash2Icon } from 'lucide-react'
import { type FC } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EDITOR_LABEL_LINE_CLASS } from '@/features/trip-editor/editor-form'
import type { InfoBlockInput, InfoSectionsFormInput, InfoSectionsFormValues } from '@/features/trip-editor/editor-schema'
import { InfoBlockRow } from '@/features/trip-editor/info-block-row'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const EMPTY_BLOCK = { kind: 'paragraph', emphasis: null, text: null, linkLabel: null, linkUrl: null } satisfies InfoBlockInput

const SECTION_TITLE_LABEL = '섹션 제목'
const DEFAULT_OPEN_LABEL = '기본 펼침'
const BLOCK_ADD_LABEL = '블록 추가'
const BLOCK_REMOVE_LABEL = '블록 삭제'
const SECTION_REMOVE_LABEL = '섹션 삭제'
const EMPTY_BLOCKS_TEXT = '블록이 없습니다.'
const CELL_CLASS = 'flex min-h-10 items-center gap-2 bg-card px-4'

type InfoSectionRowProps = {
    sectionIndex: number
    onRemove: () => void
}

export const InfoSectionRow: FC<InfoSectionRowProps> = ({ sectionIndex, onRemove }) => {
    const { control, register, formState } = useFormContext<InfoSectionsFormInput, unknown, InfoSectionsFormValues>()
    const blocks = useFieldArray({ control, name: `items.${sectionIndex}.blocks`, keyName: 'fieldKey' })

    const errors = formState.errors.items?.[sectionIndex]
    const fieldId = `info-${sectionIndex}`

    return (
        <div className='flex flex-col gap-3'>
            <EditorField label={SECTION_TITLE_LABEL} htmlFor={`${fieldId}-title`} error={errors?.title?.message}>
                <Input
                    id={`${fieldId}-title`}
                    className={EDITOR_INPUT_CLASS}
                    aria-invalid={!!errors?.title}
                    {...register(`items.${sectionIndex}.title`)}
                />
            </EditorField>
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <div className={CELL_CLASS}>
                    <Controller
                        control={control}
                        name={`items.${sectionIndex}.isDefaultOpen`}
                        render={({ field }) => (
                            <Switch id={`${fieldId}-default-open`} checked={field.value ?? false} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label className={cn(EDITOR_LABEL_LINE_CLASS, 'text-xs font-medium text-muted-foreground')} htmlFor={`${fieldId}-default-open`}>
                        {DEFAULT_OPEN_LABEL}
                    </Label>
                </div>
                <Button type='button' variant='cell' size='cell' onClick={() => blocks.append(EMPTY_BLOCK)}>
                    <PlusIcon />
                    {BLOCK_ADD_LABEL}
                </Button>
                <Button type='button' variant='cellDestructive' size='cell' onClick={onRemove}>
                    <Trash2Icon />
                    {SECTION_REMOVE_LABEL}
                </Button>
            </div>
            {blocks.fields.length === 0 ? (
                <p className='text-xs text-muted-foreground'>{EMPTY_BLOCKS_TEXT}</p>
            ) : (
                <SortableRows ids={blocks.fields.map((block) => block.fieldKey)} onReorder={blocks.move}>
                    {blocks.fields.map((block, blockIndex) => (
                        <SortableRow
                            key={block.fieldKey}
                            id={block.fieldKey}
                            index={blockIndex}
                            removeLabel={BLOCK_REMOVE_LABEL}
                            onRemove={() => blocks.remove(blockIndex)}>
                            <InfoBlockRow sectionIndex={sectionIndex} blockIndex={blockIndex} />
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
        </div>
    )
}
