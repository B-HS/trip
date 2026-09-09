'use client'

import type { FC, PropsWithChildren } from 'react'
import { cn } from '@/shared/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'

type EditorFieldProps = PropsWithChildren<{
    label: string
    htmlFor: string
    error?: string
    hint?: string
    className?: string
}>

export const EditorField: FC<EditorFieldProps> = ({ label, htmlFor, error, hint, className, children }) => (
    <Field className={cn('gap-1.5', className)} data-invalid={error !== undefined}>
        <FieldLabel className='text-xs font-medium text-muted-foreground' htmlFor={htmlFor}>
            {label}
        </FieldLabel>
        {children}
        {hint !== undefined && <p className='text-xs text-muted-foreground'>{hint}</p>}
        {error !== undefined && <FieldError className='text-xs'>{error}</FieldError>}
    </Field>
)
