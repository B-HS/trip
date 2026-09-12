import { describe, expect, test } from 'bun:test'
import { getAuthCapabilities } from '@/shared/lib/auth-capabilities'

const emptyEnv = {
    GITHUB_CLIENT_ID: undefined,
    GITHUB_CLIENT_SECRET: undefined,
    NAVER_CLIENT_ID: undefined,
    NAVER_CLIENT_SECRET: undefined,
    EMAIL_WORKER_URL: undefined,
    EMAIL_WORKER_TOKEN: undefined,
    EMAIL_FROM: undefined,
}

describe('getAuthCapabilities', () => {
    test('keeps optional providers and email verification disabled without complete configuration', () => {
        expect(getAuthCapabilities(emptyEnv)).toEqual({ socialProviders: [], emailVerification: false })
        expect(getAuthCapabilities({ ...emptyEnv, GITHUB_CLIENT_ID: 'client-id' })).toEqual({ socialProviders: [], emailVerification: false })
    })

    test('enables each configured OAuth provider independently', () => {
        expect(getAuthCapabilities({ ...emptyEnv, GITHUB_CLIENT_ID: 'id', GITHUB_CLIENT_SECRET: 'secret' }).socialProviders).toEqual(['github'])
        expect(getAuthCapabilities({ ...emptyEnv, NAVER_CLIENT_ID: 'id', NAVER_CLIENT_SECRET: 'secret' }).socialProviders).toEqual(['naver'])
    })

    test('requires every email worker setting before enabling verification', () => {
        const configured = {
            ...emptyEnv,
            EMAIL_WORKER_URL: 'https://mail.example.com',
            EMAIL_WORKER_TOKEN: 'token',
            EMAIL_FROM: 'noreply@example.com',
        }
        expect(getAuthCapabilities(configured).emailVerification).toBe(true)
        expect(getAuthCapabilities({ ...configured, EMAIL_FROM: undefined }).emailVerification).toBe(false)
    })
})
