'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginValues } from '@/entities/auth/auth.validate'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

type LoginFormProps = {
    onSubmit: (values: LoginValues) => Promise<string | null>
    isPending: boolean
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, isPending }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } })

    const { errors } = form.formState
    const passwordToggleLabel = isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
    const handleSubmit = form.handleSubmit(async (values) => setErrorMessage(await onSubmit(values)))

    return (
        <form className='flex flex-col gap-4' onSubmit={handleSubmit} noValidate>
            <FieldGroup className='gap-4'>
                <Field data-invalid={!!errors.identifier}>
                    <FieldLabel htmlFor='login-identifier'>이메일 또는 사용자명</FieldLabel>
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
                    <FieldLabel htmlFor='login-password'>비밀번호</FieldLabel>
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
                    {errorMessage}
                </p>
            )}
            <div className='flex gap-px bg-background'>
                <Button className='flex-1' type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                    {isPending ? '로그인 중…' : '로그인'}
                </Button>
            </div>
        </form>
    )
}
