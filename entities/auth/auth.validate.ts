import { z } from 'zod'
import {
    NAME_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_PATTERN,
} from '@/shared/constant/auth'

const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH, `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`)
    .max(PASSWORD_MAX_LENGTH, `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하로 입력해 주세요.`)

export const loginSchema = z.object({
    identifier: z.string().trim().min(1, '이메일 또는 사용자명을 입력해 주세요.'),
    password: passwordSchema,
})

export const signupSchema = z
    .object({
        name: z.string().trim().min(1, '이름을 입력해 주세요.').max(NAME_MAX_LENGTH, `이름은 ${NAME_MAX_LENGTH}자 이하로 입력해 주세요.`),
        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(USERNAME_MIN_LENGTH, `사용자명은 ${USERNAME_MIN_LENGTH}자 이상 입력해 주세요.`)
            .max(USERNAME_MAX_LENGTH, `사용자명은 ${USERNAME_MAX_LENGTH}자 이하로 입력해 주세요.`)
            .regex(USERNAME_PATTERN, '사용자명은 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.'),
        email: z.email('올바른 이메일 주소를 입력해 주세요.'),
        password: passwordSchema,
        passwordConfirm: z.string().min(1, '비밀번호를 한 번 더 입력해 주세요.'),
    })
    .refine((values) => values.password === values.passwordConfirm, {
        message: '비밀번호가 일치하지 않습니다.',
        path: ['passwordConfirm'],
    })

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
