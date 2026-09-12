'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC } from 'react'
import { sendVerificationEmail } from '@/shared/lib/auth-client'
import { Button } from '@/shared/ui/button'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

export const VerifyEmailWidget: FC = () => {
    const t = useTranslations('verification')
    const [email, setEmail] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [isSent, setIsSent] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsPending(true)
        const { error } = await sendVerificationEmail({ email, callbackURL: window.location.href })
        setIsPending(false)
        setIsSent(!error)
    }

    return (
        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
            <Field>
                <FieldLabel htmlFor='verification-email'>{t('emailLabel')}</FieldLabel>
                <Input
                    id='verification-email'
                    type='email'
                    value={email}
                    placeholder={t('emailPlaceholder')}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </Field>
            <Button type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                {isPending ? t('sending') : t('resend')}
            </Button>
            {isSent && (
                <p className='text-sm text-muted-foreground' role='status'>
                    {t('sent')}
                </p>
            )}
        </form>
    )
}
