import { z } from 'zod'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '@/shared/constant/auth'

const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH, 'validation.passwordTooShort').max(PASSWORD_MAX_LENGTH, 'validation.passwordTooLong')

export const loginSchema = z.object({
    identifier: z.string().trim().min(1, 'validation.identifierRequired'),
    password: passwordSchema,
})

export const signupSchema = z
    .object({
        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(USERNAME_MIN_LENGTH, 'validation.usernameTooShort')
            .max(USERNAME_MAX_LENGTH, 'validation.usernameTooLong')
            .regex(USERNAME_PATTERN, 'validation.usernamePattern'),
        email: z.email('validation.emailInvalid'),
        password: passwordSchema,
        passwordConfirm: z.string().min(1, 'validation.passwordConfirmRequired'),
    })
    .refine((values) => values.password === values.passwordConfirm, {
        message: 'validation.passwordMismatch',
        path: ['passwordConfirm'],
    })

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
