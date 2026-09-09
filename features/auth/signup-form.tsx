'use client'
'use no memo'

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
    const passwordToggleLabel = isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
    const passwordInputType = isPasswordVisible ? 'text' : 'password'
    const handleSubmit = form.handleSubmit(async (values) => setErrorMessage(await onSubmit(values)))

    return (
        <form className='flex flex-col gap-4' onSubmit={handleSubmit} noValidate>
            <FieldGroup className='gap-4'>
                <Field data-invalid={!!errors.username}>
                    <FieldLabel htmlFor='signup-username'>사용자명</FieldLabel>
                    <Input
                        id='signup-username'
                        autoComplete='username'
                        placeholder='trip'
                        aria-invalid={!!errors.username}
                        {...form.register('username')}
                    />
                    <FieldDescription>
                        영문 소문자, 숫자, 밑줄(_), 마침표(.)로 {USERNAME_MIN_LENGTH}~{USERNAME_MAX_LENGTH}자입니다.
                    </FieldDescription>
                    <FieldError errors={[errors.username]} />
                </Field>
                <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor='signup-email'>이메일</FieldLabel>
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
                    <FieldLabel htmlFor='signup-password'>비밀번호</FieldLabel>
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
                    <FieldLabel htmlFor='signup-password-confirm'>비밀번호 확인</FieldLabel>
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
            <Button type='submit' disabled={isPending}>
                {isPending ? '가입 중…' : '회원가입'}
            </Button>
        </form>
    )
}
