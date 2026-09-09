import { describe, expect, test } from 'bun:test'
import { loginSchema, signupSchema } from '@/entities/auth/auth.validate'
import { PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH } from '@/shared/constant/auth'

const VALID_PASSWORD = 'trip-1234'

const validSignupValues = {
    username: 'trip.user',
    email: 'trip@example.com',
    password: VALID_PASSWORD,
    passwordConfirm: VALID_PASSWORD,
}

describe('loginSchema', () => {
    test('이메일 형식의 식별자를 통과시킨다', () => {
        expect(loginSchema.safeParse({ identifier: 'trip@example.com', password: VALID_PASSWORD }).success).toBe(true)
    })

    test('사용자명 형식의 식별자를 통과시킨다', () => {
        expect(loginSchema.safeParse({ identifier: 'tripuser', password: VALID_PASSWORD }).success).toBe(true)
    })

    test('식별자가 비어 있으면 실패한다', () => {
        expect(loginSchema.safeParse({ identifier: '   ', password: VALID_PASSWORD }).success).toBe(false)
    })

    test('비밀번호가 최소 길이보다 짧으면 실패한다', () => {
        expect(loginSchema.safeParse({ identifier: 'tripuser', password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1) }).success).toBe(false)
    })
})

describe('signupSchema', () => {
    test('올바른 값이면 통과한다', () => {
        expect(signupSchema.safeParse(validSignupValues).success).toBe(true)
    })

    test('사용자명을 소문자로 정규화한다', () => {
        const result = signupSchema.safeParse({ ...validSignupValues, username: 'TripUser' })
        expect(result.success).toBe(true)
        expect(result.data?.username).toBe('tripuser')
    })

    test('허용되지 않은 문자가 있는 사용자명은 실패한다', () => {
        expect(signupSchema.safeParse({ ...validSignupValues, username: 'trip user!' }).success).toBe(false)
    })

    test('사용자명이 최소 길이보다 짧으면 실패한다', () => {
        expect(signupSchema.safeParse({ ...validSignupValues, username: 'a'.repeat(USERNAME_MIN_LENGTH - 1) }).success).toBe(false)
    })

    test('이메일 형식이 아니면 실패한다', () => {
        expect(signupSchema.safeParse({ ...validSignupValues, email: 'trip-example.com' }).success).toBe(false)
    })

    test('이름을 넘겨도 결과에 포함하지 않는다', () => {
        const result = signupSchema.safeParse({ ...validSignupValues, name: '변현석' })
        expect(result.success).toBe(true)
        expect(result.data).not.toHaveProperty('name')
    })

    test('비밀번호 확인이 다르면 passwordConfirm 경로로 실패한다', () => {
        const result = signupSchema.safeParse({ ...validSignupValues, passwordConfirm: 'trip-9999' })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(['passwordConfirm'])
        expect(result.error?.issues[0]?.message).toBe('비밀번호가 일치하지 않습니다.')
    })
})
