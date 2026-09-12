import { NextResponse } from 'next/server'
import { z } from 'zod'
import { recordUserConsents, validateConsentVersions } from '@/entities/auth/auth.consent'
import { getAuth } from '@/shared/lib/auth'
import { getAuthCapabilities } from '@/shared/lib/auth-capabilities'
import { getEnv } from '@/shared/lib/env'

const signupRequestSchema = z.object({
    name: z.string().trim().min(1),
    email: z.email(),
    password: z.string().min(1),
    username: z.string().trim().min(1),
    displayUsername: z.string().trim().min(1),
    callbackURL: z.string().url().optional(),
    termsVersion: z.string().min(1),
    privacyVersion: z.string().min(1),
})

export const POST = async (request: Request) => {
    let input: unknown
    try {
        input = await request.json()
    } catch {
        return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const parsed = signupRequestSchema.safeParse(input)
    if (!parsed.success) return NextResponse.json({ code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message }, { status: 400 })

    const { termsVersion, privacyVersion, ...body } = parsed.data
    try {
        validateConsentVersions({ terms: termsVersion, privacy: privacyVersion })
    } catch {
        return NextResponse.json({ code: 'CONSENT_VERSION_MISMATCH' }, { status: 400 })
    }

    const authResponse = await getAuth().api.signUpEmail({ body, headers: request.headers, asResponse: true })
    if (!authResponse.ok) return authResponse

    const payload = (await authResponse.json()) as { user?: { id?: string }; token?: string | null }
    if (!payload.user?.id) return NextResponse.json({ code: 'FAILED_TO_CREATE_USER' }, { status: 422 })

    try {
        await recordUserConsents(payload.user.id, { terms: termsVersion, privacy: privacyVersion })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ code: 'CONSENT_SAVE_FAILED' }, { status: 500 })
    }

    const headers = new Headers()
    const setCookie = authResponse.headers.get('set-cookie')
    if (setCookie) headers.set('set-cookie', setCookie)
    return NextResponse.json(
        { ...payload, verificationRequired: getAuthCapabilities(getEnv()).emailVerification },
        { status: authResponse.status, headers },
    )
}
