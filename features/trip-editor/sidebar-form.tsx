'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { sidebarSchema, type SidebarInput, type SidebarLinkInput, type SidebarValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EDITOR_TEXTAREA_CLASS, EMPTY_TO_NULL, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const EMPTY_LINK = { label: '', url: '', description: null } satisfies SidebarLinkInput

type SidebarFormProps = {
    defaultValues: SidebarInput
    onSubmit: EditorSubmit<SidebarValues>
    isPending: boolean
}

export const SidebarForm: FC<SidebarFormProps> = ({ defaultValues, onSubmit, isPending }) => {
    const didResetRef = useRef(false)
    const form = useForm<SidebarInput, unknown, SidebarValues>({ resolver: zodResolver(sidebarSchema), defaultValues })
    const rows = useFieldArray({ control: form.control, name: 'links', keyName: 'fieldKey' })

    const { errors, isDirty } = form.formState
    const linkErrors = errors.links
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
            <EditorPanel title='소개 문구' description='뷰어 사이드바의 기간 줄 아래에 보여 줍니다.'>
                <EditorField label='소개 문구' htmlFor='sidebar-note' error={errors.sidebarNote?.message}>
                    <Textarea
                        id='sidebar-note'
                        className={EDITOR_TEXTAREA_CLASS}
                        aria-invalid={!!errors.sidebarNote}
                        {...form.register('sidebarNote', EMPTY_TO_NULL)}
                    />
                </EditorField>
            </EditorPanel>
            <EditorToolbar
                title='링크'
                description='사이드바 숙소 아래에 보여 주는 링크 목록입니다.'
                count={rows.fields.length}
                action={
                    <Button type='button' variant='cell' size='cell' onClick={() => rows.append(EMPTY_LINK)}>
                        <PlusIcon />
                        링크 추가
                    </Button>
                }
            />
            {rows.fields.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 링크가 없습니다.</p>
            ) : (
                <SortableRows ids={rows.fields.map((row) => row.fieldKey)} onReorder={rows.move}>
                    {rows.fields.map((row, index) => (
                        <SortableRow key={row.fieldKey} id={row.fieldKey} index={index} removeLabel='링크 삭제' onRemove={() => rows.remove(index)}>
                            <div className='grid gap-3 sm:grid-cols-2'>
                                <EditorField label='라벨' htmlFor={`sidebar-link-${index}-label`} error={linkErrors?.[index]?.label?.message}>
                                    <Input
                                        id={`sidebar-link-${index}-label`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!linkErrors?.[index]?.label}
                                        {...form.register(`links.${index}.label`)}
                                    />
                                </EditorField>
                                <EditorField label='주소' htmlFor={`sidebar-link-${index}-url`} error={linkErrors?.[index]?.url?.message}>
                                    <Input
                                        id={`sidebar-link-${index}-url`}
                                        className={EDITOR_INPUT_CLASS}
                                        type='url'
                                        placeholder='https://'
                                        aria-invalid={!!linkErrors?.[index]?.url}
                                        {...form.register(`links.${index}.url`)}
                                    />
                                </EditorField>
                                <EditorField
                                    label='설명'
                                    htmlFor={`sidebar-link-${index}-description`}
                                    error={linkErrors?.[index]?.description?.message}
                                    className='sm:col-span-2'>
                                    <Input
                                        id={`sidebar-link-${index}-description`}
                                        className={EDITOR_INPUT_CLASS}
                                        aria-invalid={!!linkErrors?.[index]?.description}
                                        {...form.register(`links.${index}.description`, EMPTY_TO_NULL)}
                                    />
                                </EditorField>
                            </div>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
        </EditorFormShell>
    )
}
