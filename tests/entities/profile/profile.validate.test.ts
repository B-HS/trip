import { describe, expect, test } from 'bun:test'
import { profileUpdateSchema, usernameChangeSchema } from '@/entities/profile/profile.validate'
import { PROFILE_BIO_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH, PROFILE_NAME_MIN_LENGTH } from '@/shared/constant/community'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/shared/constant/auth'

const UPLOAD_ID = '2f5a5f12-1f5b-4b3d-8e33-58f0b7e1c6c2'

const validProfile = { name: '변현석', avatarUploadId: null, bannerUploadId: null }

describe('profileUpdateSchema', () => {
    test('올바른 값이면 통과하고 소개 기본값은 null 이다', () => {
        const result = profileUpdateSchema.safeParse(validProfile)
        expect(result.success).toBe(true)
        expect(result.data?.bio).toBeNull()
    })

    test('표시 이름이 최소 길이보다 짧으면 실패한다', () => {
        expect(profileUpdateSchema.safeParse({ ...validProfile, name: 'a'.repeat(PROFILE_NAME_MIN_LENGTH - 1) }).success).toBe(false)
    })

    test('표시 이름이 최대 길이를 넘으면 실패한다', () => {
        expect(profileUpdateSchema.safeParse({ ...validProfile, name: 'a'.repeat(PROFILE_NAME_MAX_LENGTH + 1) }).success).toBe(false)
    })

    test('소개가 최대 길이를 넘으면 실패한다', () => {
        expect(profileUpdateSchema.safeParse({ ...validProfile, bio: 'a'.repeat(PROFILE_BIO_MAX_LENGTH + 1) }).success).toBe(false)
    })

    test('업로드 id 가 uuid 가 아니면 실패한다', () => {
        expect(profileUpdateSchema.safeParse({ ...validProfile, avatarUploadId: 'upload-1' }).success).toBe(false)
    })

    test('업로드 id 가 uuid 면 통과한다', () => {
        expect(profileUpdateSchema.safeParse({ ...validProfile, bannerUploadId: UPLOAD_ID }).data?.bannerUploadId).toBe(UPLOAD_ID)
    })

    test('업로드 id 를 생략하면 undefined 로 남아 기존 이미지를 유지한다', () => {
        const result = profileUpdateSchema.safeParse({ name: '변현석' })
        expect(result.success).toBe(true)
        expect(result.data?.avatarUploadId).toBeUndefined()
        expect(result.data?.bannerUploadId).toBeUndefined()
    })

    test('업로드 id 가 null 이면 제거 의도로 남는다', () => {
        const result = profileUpdateSchema.parse(validProfile)
        expect(result.avatarUploadId).toBeNull()
        expect(result.bannerUploadId).toBeNull()
    })
})

describe('usernameChangeSchema', () => {
    test('올바른 사용자명은 통과한다', () => {
        expect(usernameChangeSchema.safeParse('new_user.1').success).toBe(true)
    })

    test('앞뒤 공백을 제거하고 소문자로 바꾼다', () => {
        expect(usernameChangeSchema.parse('  New_User  ')).toBe('new_user')
    })

    test('최소 길이보다 짧으면 실패한다', () => {
        expect(usernameChangeSchema.safeParse('a'.repeat(USERNAME_MIN_LENGTH - 1)).success).toBe(false)
    })

    test('최대 길이를 넘으면 실패한다', () => {
        expect(usernameChangeSchema.safeParse('a'.repeat(USERNAME_MAX_LENGTH + 1)).success).toBe(false)
    })

    test('허용되지 않은 문자가 있으면 실패한다', () => {
        expect(usernameChangeSchema.safeParse('user-name').success).toBe(false)
        expect(usernameChangeSchema.safeParse('user name').success).toBe(false)
        expect(usernameChangeSchema.safeParse('한글사용자').success).toBe(false)
    })

    test('숫자·밑줄·마침표는 통과한다', () => {
        expect(usernameChangeSchema.safeParse('a1._9').success).toBe(true)
    })
})
