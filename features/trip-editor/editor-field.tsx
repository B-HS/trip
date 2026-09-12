'use client'

import { useTranslations } from 'next-intl'
import type { FC, PropsWithChildren } from 'react'
import { EDITOR_LABEL_LINE_CLASS } from '@/features/trip-editor/editor-form'
import { translateMessage } from '@/shared/lib/message-key'
import { cn } from '@/shared/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'

type EditorFieldProps = PropsWithChildren<{
    label: string
    htmlFor: string
    error?: string
    hint?: string
    className?: string
}>

export const EditorField: FC<EditorFieldProps> = ({ label, htmlFor, error, hint, className, children }) => {
    const t = useTranslations()
    return (
        <Field className={cn('gap-1.5', className)} data-invalid={error !== undefined}>
            <FieldLabel className={cn(EDITOR_LABEL_LINE_CLASS, 'text-xs font-medium text-muted-foreground')} htmlFor={htmlFor}>
                {label}
            </FieldLabel>
            {children}
            {hint !== undefined && <p className='text-xs text-muted-foreground'>{hint}</p>}
            {error !== undefined && <FieldError className='text-xs'>{translateMessage(t, error)}</FieldError>}
        </Field>
    )
}
