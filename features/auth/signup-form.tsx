'use client'
'use no memo'

import { useTranslations } from 'next-intl'

import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { signupSchema, type SignupValues } from '@/entities/auth/auth.validate'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/shared/constant/auth'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

type SignupFormProps = {
    onSubmit: (values: SignupValues) => Promise<string | null>
    isPending: boolean
}

const SIGNUP_DEFAULT_VALUES: SignupValues = { username: '', email: '', password: '', passwordConfirm: '' }

export const SignupForm: FC<SignupFormProps> = ({ onSubmit, isPending }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: SIGNUP_DEFAULT_VALUES })

    const { errors } = form.formState
    const t = useTranslations('auth.signup')
    const passwordToggleLabel = isPasswordVisible ? t('hidePassword') : t('showPassword')
    const passwordInputType = isPasswordVisible ? 'text' : 'password'
    const handleSubmit = form.handleSubmit(async (values) => setErrorMessage(await onSubmit(values)))

    return (
        <form className='flex flex-col gap-4' onSubmit={handleSubmit} noValidate>
            <FieldGroup className='gap-4'>
                <Field data-invalid={!!errors.username}>
                    <FieldLabel htmlFor='signup-username'>{t('usernameLabel')}</FieldLabel>
                    <Input
                        id='signup-username'
                        autoComplete='username'
                        placeholder='trip'
                        aria-invalid={!!errors.username}
                        {...form.register('username')}
                    />
                    <FieldDescription>{t('usernameHint', { min: USERNAME_MIN_LENGTH, max: USERNAME_MAX_LENGTH })}</FieldDescription>
                    <FieldError errors={[errors.username]} />
                </Field>
                <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor='signup-email'>{t('emailLabel')}</FieldLabel>
                    <Input
                        id='signup-email'
                        type='email'
                        autoComplete='email'
                        placeholder='trip@example.com'
                        aria-invalid={!!errors.email}
                        {...form.register('email')}
                    />
                    <FieldError errors={[errors.email]} />
                </Field>
                <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor='signup-password'>{t('passwordLabel')}</FieldLabel>
                    <div className='relative'>
                        <Input
                            id='signup-password'
                            className='pr-10'
                            type={passwordInputType}
                            autoComplete='new-password'
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
                <Field data-invalid={!!errors.passwordConfirm}>
                    <FieldLabel htmlFor='signup-password-confirm'>{t('passwordConfirmLabel')}</FieldLabel>
                    <Input
                        id='signup-password-confirm'
                        type={passwordInputType}
                        autoComplete='new-password'
                        aria-invalid={!!errors.passwordConfirm}
                        {...form.register('passwordConfirm')}
                    />
                    <FieldError errors={[errors.passwordConfirm]} />
                </Field>
            </FieldGroup>
            {errorMessage && (
                <p className='text-sm text-destructive' role='alert'>
                    {errorMessage}
                </p>
            )}
            <div className='flex gap-px bg-background'>
                <Button className='flex-1' type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                </Button>
            </div>
        </form>
    )
}
