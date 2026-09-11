'use client'

import type { Route } from 'next'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useState, type FC } from 'react'
import { getAuthErrorMessage } from '@/entities/auth/auth.error'
import type { LoginValues } from '@/entities/auth/auth.validate'
import { LoginForm } from '@/features/auth/login-form'
import { HOME_PATH } from '@/shared/constant/route'
import { signIn } from '@/shared/lib/auth-client'

const DEFAULT_REDIRECT_PATH: Route = HOME_PATH
const INTERNAL_PATH_PATTERN = /^\/(?![/\\])/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/

const isInternalPath = (path: string) => INTERNAL_PATH_PATTERN.test(path) && !CONTROL_CHARACTER_PATTERN.test(path)

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
