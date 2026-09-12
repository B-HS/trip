import {
    UPLOAD_IMAGE_EXTENSION,
    UPLOAD_IMAGE_MIME_TYPES,
    UPLOAD_MAX_BYTES,
    type UploadImageMimeType,
    type UploadKind,
} from '@/shared/constant/upload'

type ByteSignature = { offset: number; bytes: readonly number[] }

const IMAGE_SIGNATURE = {
    'image/jpeg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
    'image/png': [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
    'image/gif': [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }],
    'image/webp': [
        { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
        { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
    'image/avif': [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66] }],
} as const satisfies Record<UploadImageMimeType, readonly ByteSignature[]>

export const UPLOAD_ISSUE = {
    EMPTY: 'validation.uploadEmpty',
    TOO_LARGE: 'validation.uploadTooLarge',
    UNSUPPORTED_TYPE: 'validation.uploadUnsupportedType',
    CONTENT_MISMATCH: 'validation.uploadContentMismatch',
} as const

export type UploadIssue = (typeof UPLOAD_ISSUE)[keyof typeof UPLOAD_ISSUE]

export type UploadMetaResult = { ok: true; mime: UploadImageMimeType } | { ok: false; issue: UploadIssue }

export const isUploadImageMimeType = (value: string): value is UploadImageMimeType => UPLOAD_IMAGE_MIME_TYPES.some((mime) => mime === value)

export const validateUploadMeta = ({ size, type }: { size: number; type: string }): UploadMetaResult => {
    if (size <= 0) return { ok: false, issue: UPLOAD_ISSUE.EMPTY }
    if (size > UPLOAD_MAX_BYTES) return { ok: false, issue: UPLOAD_ISSUE.TOO_LARGE }
    if (!isUploadImageMimeType(type)) return { ok: false, issue: UPLOAD_ISSUE.UNSUPPORTED_TYPE }
    return { ok: true, mime: type }
}

export const hasImageSignature = (bytes: Uint8Array, mime: UploadImageMimeType) =>
    IMAGE_SIGNATURE[mime].every((signature) => signature.bytes.every((byte, index) => bytes[signature.offset + index] === byte))

export const buildUploadKey = ({ kind, year, mime, uuid }: { kind: UploadKind; year: string; mime: UploadImageMimeType; uuid: string }) =>
    `uploads/${kind}/${year}/${uuid}.${UPLOAD_IMAGE_EXTENSION[mime]}`
