'use client'

import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useState, type FC } from 'react'
import { getAuthErrorMessage } from '@/entities/auth/auth.error'
import type { SignupFormValues } from '@/entities/auth/auth.validate'
import { SignupForm } from '@/features/auth/signup-form'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/shared/constant/legal'

const SIGNUP_REDIRECT_PATH = '/'

export const SignupWidget: FC = () => {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const locale = useLocale()

    const handleSubmit = async (values: SignupFormValues) => {
        setIsPending(true)
        const callbackPath = locale === 'ko' ? '/verify-email' : `/${locale}/verify-email`
        const response = await fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                name: values.username,
                email: values.email,
                password: values.password,
                username: values.username,
                displayUsername: values.username,
                callbackURL: `${window.location.origin}${callbackPath}`,
                termsVersion: TERMS_VERSION,
                privacyVersion: PRIVACY_VERSION,
            }),
        })
        const result = (await response.json()) as { code?: string; verificationRequired?: boolean }

        if (!response.ok) {
            setIsPending(false)
            return getAuthErrorMessage(result.code)
        }

        router.push(result.verificationRequired ? '/verify-email' : SIGNUP_REDIRECT_PATH)
        router.refresh()
        return null
    }

    return <SignupForm onSubmit={handleSubmit} isPending={isPending} />
}
