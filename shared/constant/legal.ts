export const TERMS_VERSION = '2026-09-12'
export const PRIVACY_VERSION = '2026-09-12'

export const LEGAL_DOCUMENTS = ['terms', 'privacy'] as const
export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number]
