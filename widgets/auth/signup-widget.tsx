'use client'

import { useRouter } from 'next/navigation'
import { useState, type FC } from 'react'
import { getAuthErrorMessage } from '@/entities/auth/auth.error'
import type { SignupValues } from '@/entities/auth/auth.validate'
import { SignupForm } from '@/features/auth/signup-form'
import { signUp } from '@/shared/lib/auth-client'

const SIGNUP_REDIRECT_PATH = '/'

export const SignupWidget: FC = () => {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleSubmit = async (values: SignupValues) => {
        setIsPending(true)
        const { error } = await signUp.email({
            name: values.username,
            email: values.email,
            password: values.password,
            username: values.username,
            displayUsername: values.username,
        })

        if (error) {
            setIsPending(false)
            return getAuthErrorMessage(error.code)
        }

        router.push(SIGNUP_REDIRECT_PATH)
        router.refresh()
        return null
    }

    return <SignupForm onSubmit={handleSubmit} isPending={isPending} />
}
