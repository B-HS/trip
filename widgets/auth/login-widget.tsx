'use client'

import type { Route } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FC } from 'react'
import { getAuthErrorMessage } from '@/entities/auth/auth.error'
import type { LoginValues } from '@/entities/auth/auth.validate'
import { LoginForm } from '@/features/auth/login-form'
import { signIn } from '@/shared/lib/auth-client'

const DEFAULT_REDIRECT_PATH: Route = '/trips'

const isInternalPath = (path: string) => path.startsWith('/') && !path.startsWith('//')

export const LoginWidget: FC = () => {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const nextPath = searchParams.get('next')
    const redirectPath = nextPath && isInternalPath(nextPath) ? (nextPath as Route) : DEFAULT_REDIRECT_PATH

    const handleSubmit = async (values: LoginValues) => {
        setIsPending(true)
        const { error } = values.identifier.includes('@')
            ? await signIn.email({ email: values.identifier, password: values.password })
            : await signIn.username({ username: values.identifier, password: values.password })

        if (error) {
            setIsPending(false)
            return getAuthErrorMessage(error.code)
        }

        router.push(redirectPath)
        router.refresh()
        return null
    }

    return <LoginForm onSubmit={handleSubmit} isPending={isPending} />
}
