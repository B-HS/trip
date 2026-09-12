import { and, eq } from 'drizzle-orm'
import { ApiError } from '@/shared/lib/api-response'
import { LEGAL_DOCUMENTS, PRIVACY_VERSION, TERMS_VERSION, type LegalDocument } from '@/shared/constant/legal'
import { userConsent } from '@/shared/db/schema/auth'
import { getDb } from '@/shared/db/client'

const CURRENT_VERSIONS: Record<LegalDocument, string> = {
    terms: TERMS_VERSION,
    privacy: PRIVACY_VERSION,
}

type ConsentInput = Record<LegalDocument, string>

export const validateConsentVersions = (input: ConsentInput) => {
    for (const document of LEGAL_DOCUMENTS) {
        if (input[document] !== CURRENT_VERSIONS[document]) throw new ApiError('VALIDATION_ERROR', 'auth.errors.CONSENT_VERSION_MISMATCH')
    }
}

export const recordUserConsents = async (userId: string, input: ConsentInput) => {
    validateConsentVersions(input)
    const db = getDb()
    const acceptedAt = new Date()
    await Promise.all(
        LEGAL_DOCUMENTS.map((document) =>
            db.insert(userConsent).values({ userId, document, version: input[document], acceptedAt }).onDuplicateKeyUpdate({ set: { acceptedAt } }),
        ),
    )
}

export const hasCurrentUserConsents = async (userId: string) => {
    const rows = await getDb()
        .select({ document: userConsent.document, version: userConsent.version })
        .from(userConsent)
        .where(eq(userConsent.userId, userId))
    return LEGAL_DOCUMENTS.every((document) => rows.some((row) => row.document === document && row.version === CURRENT_VERSIONS[document]))
}

export const findUserConsent = async (userId: string, document: LegalDocument) => {
    const [row] = await getDb()
        .select()
        .from(userConsent)
        .where(and(eq(userConsent.userId, userId), eq(userConsent.document, document)))
        .limit(1)
    return row ?? null
}
