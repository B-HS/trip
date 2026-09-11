'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC, type FormEvent } from 'react'
import { COMMENT_BODY_MAX_LENGTH } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

export type CommentFormProps = {
    placeholder: string
    isPending: boolean
    onSubmit: (body: string) => void
    onCancel?: () => void
}

export const CommentForm: FC<CommentFormProps> = ({ placeholder, isPending, onSubmit, onCancel }) => {
    const t = useTranslations('community.comments')
    const [body, setBody] = useState('')

    const trimmedBody = body.trim()
    const isSubmittable = trimmedBody.length > 0 && !isPending
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!isSubmittable) return
        onSubmit(trimmedBody)
    }

    return (
        <form className='flex flex-col gap-px bg-background' onSubmit={handleSubmit} noValidate>
            <Textarea
                className='min-h-20 rounded-none bg-card'
                value={body}
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={COMMENT_BODY_MAX_LENGTH}
                onChange={(event) => setBody(event.target.value)}
            />
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                {onCancel !== undefined && (
                    <Button type='button' variant='cell' size='cell' onClick={onCancel}>
                        {t('cancel')}
                    </Button>
                )}
                <Button type='submit' variant='cellPrimary' size='cell' disabled={!isSubmittable}>
                    {isPending ? t('submitting') : t('submit')}
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        </form>
    )
}
