const BYTES_PER_KILOBYTE = 1024
const KILOBYTES_PER_MEGABYTE = 1024
const UPLOAD_MAX_MEGABYTES = 3

export const UPLOAD_MAX_BYTES = UPLOAD_MAX_MEGABYTES * KILOBYTES_PER_MEGABYTE * BYTES_PER_KILOBYTE

export const UPLOAD_MAX_SIZE_LABEL = `${UPLOAD_MAX_MEGABYTES}MB`

export const UPLOAD_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] as const
export type UploadImageMimeType = (typeof UPLOAD_IMAGE_MIME_TYPES)[number]

export const UPLOAD_IMAGE_EXTENSION = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
} as const satisfies Record<UploadImageMimeType, string>

export const UPLOAD_IMAGE_ACCEPT = UPLOAD_IMAGE_MIME_TYPES.join(',')

export const UPLOAD_KINDS = ['booking', 'avatar', 'banner', 'post'] as const
export type UploadKind = (typeof UPLOAD_KINDS)[number]

export const UPLOAD_ATTACHMENT_KINDS = ['image', 'link'] as const
export type UploadAttachmentKind = (typeof UPLOAD_ATTACHMENT_KINDS)[number]
