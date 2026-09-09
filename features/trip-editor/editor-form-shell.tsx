'use client'

import { useRef, type FC, type FormEventHandler, type PropsWithChildren } from 'react'
import { EditorSaveBar } from '@/features/trip-editor/editor-save-bar'
import { useSubmitShortcut } from '@/features/trip-editor/use-submit-shortcut'
import { useUnsavedChanges } from '@/shared/hooks/use-unsaved-changes'

type EditorFormShellProps = PropsWithChildren<{
    isDirty: boolean
    isPending: boolean
    onSubmit: FormEventHandler<HTMLFormElement>
    onReset: () => void
    hint?: string
}>

export const EditorFormShell: FC<EditorFormShellProps> = ({ isDirty, isPending, onSubmit, onReset, hint, children }) => {
    const formRef = useRef<HTMLFormElement>(null)

    useUnsavedChanges(isDirty)
    useSubmitShortcut(() => formRef.current?.requestSubmit())

    return (
        <form ref={formRef} className='flex flex-col gap-px bg-background' onSubmit={onSubmit} noValidate>
            {children}
            <EditorSaveBar isDirty={isDirty} isPending={isPending} onReset={onReset} hint={hint} />
        </form>
    )
}
