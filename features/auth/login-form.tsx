'use client'
'use no memo'

import { useTranslations } from 'next-intl'

import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginValues } from '@/entities/auth/auth.validate'
import type { SocialProvider } from '@/shared/constant/auth'
import { translateMessage } from '@/shared/lib/message-key'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

type LoginFormProps = {
    onSubmit: (values: LoginValues) => Promise<string | null>
    onSocialSubmit: (provider: SocialProvider) => Promise<string | null>
    socialProviders: readonly SocialProvider[]
    isPending: boolean
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, onSocialSubmit, socialProviders, isPending }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } })

    const { errors } = form.formState
    const t = useTranslations('auth.login')
    const tMessage = useTranslations()
    const passwordToggleLabel = isPasswordVisible ? t('hidePassword') : t('showPassword')
    const handleSubmit = form.handleSubmit(async (values) => setErrorMessage(await onSubmit(values)))
    const handleSocialSubmit = async (provider: SocialProvider) => setErrorMessage(await onSocialSubmit(provider))

    return (
        <form className='flex flex-col gap-4' onSubmit={handleSubmit} noValidate>
            <FieldGroup className='gap-4'>
                <Field data-invalid={!!errors.identifier}>
                    <FieldLabel htmlFor='login-identifier'>{t('identifierLabel')}</FieldLabel>
                    <Input
                        id='login-identifier'
                        autoComplete='username'
                        placeholder='trip@example.com'
                        aria-invalid={!!errors.identifier}
                        {...form.register('identifier')}
                    />
                    <FieldError errors={[errors.identifier]} />
                </Field>
                <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor='login-password'>{t('passwordLabel')}</FieldLabel>
                    <div className='relative'>
                        <Input
                            id='login-password'
                            className='pr-10'
                            type={isPasswordVisible ? 'text' : 'password'}
                            autoComplete='current-password'
                            aria-invalid={!!errors.password}
                            {...form.register('password')}
                        />
                        <Button
                            className='absolute top-0 right-0'
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label={passwordToggleLabel}
                            title={passwordToggleLabel}
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                    </div>
                    <FieldError errors={[errors.password]} />
                </Field>
            </FieldGroup>
            {errorMessage && (
                <p className='text-sm text-destructive' role='alert'>
                    {translateMessage(tMessage, errorMessage)}
                </p>
            )}
            <div className='flex gap-px bg-background'>
                <Button className='flex-1' type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                </Button>
            </div>
            <div className='flex flex-col gap-2'>
                {socialProviders.length > 0 && <p className='text-center text-xs text-muted-foreground'>{t('socialDescription')}</p>}
                {socialProviders.map((provider) => (
                    <Button key={provider} type='button' variant='cell' size='cell' disabled={isPending} onClick={() => handleSocialSubmit(provider)}>
                        {t(`social.${provider}`)}
                    </Button>
                ))}
                {socialProviders.length === 0 && <p className='text-center text-xs text-muted-foreground'>{t('socialUnavailable')}</p>}
            </div>
        </form>
    )
}
