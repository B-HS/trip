'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { InfoSectionInput, InfoSectionValues } from '@/entities/trip/trip.validate'
import { type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { infoSectionsFormSchema, type InfoSectionsFormInput, type InfoSectionsFormValues } from '@/features/trip-editor/editor-schema'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { InfoSectionRow } from '@/features/trip-editor/info-section-row'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { Button } from '@/shared/ui/button'

const EMPTY_SECTION = { title: '', isDefaultOpen: false, blocks: [] } satisfies InfoSectionInput

type InfoSectionsFormProps = {
    defaultValues: InfoSectionInput[]
    onSubmit: EditorSubmit<InfoSectionValues[]>
    isPending: boolean
}

export const InfoSectionsForm: FC<InfoSectionsFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const didResetRef = useRef(false)
    const form = useForm<InfoSectionsFormInput, unknown, InfoSectionsFormValues>({
        resolver: zodResolver(infoSectionsFormSchema),
        defaultValues: { items: defaultValues },
    })
    const rows = useFieldArray({ control: form.control, name: 'items', keyName: 'fieldKey' })

    const { isDirty } = form.formState
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
        <FormProvider {...form}>
            <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()}>
                <EditorToolbar
                    title='여행 정보'
                    description='뷰어의 아코디언 섹션입니다. 섹션과 블록 모두 순서를 바꿀 수 있습니다.'
                    count={rows.fields.length}
                    action={
                        <Button type='button' variant='cell' size='cell' onClick={() => rows.append(EMPTY_SECTION)}>
                            <PlusIcon />
                            섹션 추가
                        </Button>
                    }
                />
                {rows.fields.length === 0 ? (
                    <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 정보 섹션이 없습니다.</p>
                ) : (
                    <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                        {rows.fields.map((row, index) => (
                            <SortableRow
                                key={row.fieldKey}
                                id={row.fieldKey}
                                index={index}
                                removeLabel='섹션 삭제'
                                onRemove={() => rows.remove(index)}>
                                <InfoSectionRow sectionIndex={index} />
                            </SortableRow>
                        ))}
                    </SortableRows>
                )}
            </EditorFormShell>
        </FormProvider>
    )
}
