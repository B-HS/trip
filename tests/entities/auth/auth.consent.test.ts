import { describe, expect, test } from 'bun:test'
import { validateConsentVersions } from '@/entities/auth/auth.consent'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/shared/constant/legal'

describe('validateConsentVersions', () => {
    test('accepts the current terms and privacy versions', () => {
        expect(() => validateConsentVersions({ terms: TERMS_VERSION, privacy: PRIVACY_VERSION })).not.toThrow()
    })

    test('rejects stale terms versions', () => {
        expect(() => validateConsentVersions({ terms: '2026-01-01', privacy: PRIVACY_VERSION })).toThrow('CONSENT_VERSION_MISMATCH')
    })

    test('rejects stale privacy versions', () => {
        expect(() => validateConsentVersions({ terms: TERMS_VERSION, privacy: '2026-01-01' })).toThrow('CONSENT_VERSION_MISMATCH')
    })
})
