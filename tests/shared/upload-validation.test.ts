import { describe, expect, test } from 'bun:test'
import { UPLOAD_MAX_BYTES } from '@/shared/constant/upload'
import { buildUploadKey, hasImageSignature, isUploadImageMimeType, UPLOAD_ISSUE, validateUploadMeta } from '@/shared/lib/upload-validation'

const SAMPLE_UUID = '11111111-2222-4333-8444-555555555555'
const SAMPLE_SIZE = 1024
const HEADER_LENGTH = 16

const withBytes = (entries: Array<[number, number[]]>) => {
    const bytes = new Uint8Array(HEADER_LENGTH)
    for (const [offset, values] of entries) bytes.set(values, offset)
    return bytes
}

const JPEG_BYTES = withBytes([[0, [0xff, 0xd8, 0xff]]])
const PNG_BYTES = withBytes([[0, [0x89, 0x50, 0x4e, 0x47]]])
const GIF_BYTES = withBytes([[0, [0x47, 0x49, 0x46, 0x38]]])
const WEBP_BYTES = withBytes([
    [0, [0x52, 0x49, 0x46, 0x46]],
    [8, [0x57, 0x45, 0x42, 0x50]],
])
const AVIF_BYTES = withBytes([[4, [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]]])

describe('isUploadImageMimeType', () => {
    test('허용 목록의 MIME 만 통과한다', () => {
        expect(isUploadImageMimeType('image/png')).toBe(true)
        expect(isUploadImageMimeType('image/svg+xml')).toBe(false)
        expect(isUploadImageMimeType('application/pdf')).toBe(false)
    })
})

describe('validateUploadMeta', () => {
    test('허용 MIME 과 크기면 통과한다', () => {
        expect(validateUploadMeta({ size: SAMPLE_SIZE, type: 'image/webp' })).toEqual({ ok: true, mime: 'image/webp' })
    })

    test('빈 파일은 거절한다', () => {
        expect(validateUploadMeta({ size: 0, type: 'image/png' })).toEqual({ ok: false, issue: UPLOAD_ISSUE.EMPTY })
    })

    test('3MB 를 넘으면 거절한다', () => {
        expect(validateUploadMeta({ size: UPLOAD_MAX_BYTES, type: 'image/png' }).ok).toBe(true)
        expect(validateUploadMeta({ size: UPLOAD_MAX_BYTES + 1, type: 'image/png' })).toEqual({ ok: false, issue: UPLOAD_ISSUE.TOO_LARGE })
    })

    test('허용하지 않는 MIME 은 거절한다', () => {
        expect(validateUploadMeta({ size: SAMPLE_SIZE, type: 'image/svg+xml' })).toEqual({ ok: false, issue: UPLOAD_ISSUE.UNSUPPORTED_TYPE })
    })
})

describe('hasImageSignature', () => {
    test('형식별 매직 바이트를 확인한다', () => {
        expect(hasImageSignature(JPEG_BYTES, 'image/jpeg')).toBe(true)
        expect(hasImageSignature(PNG_BYTES, 'image/png')).toBe(true)
        expect(hasImageSignature(GIF_BYTES, 'image/gif')).toBe(true)
        expect(hasImageSignature(WEBP_BYTES, 'image/webp')).toBe(true)
        expect(hasImageSignature(AVIF_BYTES, 'image/avif')).toBe(true)
    })

    test('MIME 과 실제 내용이 다르면 거절한다', () => {
        expect(hasImageSignature(PNG_BYTES, 'image/jpeg')).toBe(false)
        expect(hasImageSignature(withBytes([[0, [0x3c, 0x73, 0x76, 0x67]]]), 'image/png')).toBe(false)
    })

    test('RIFF 만 있고 WEBP 가 아니면 거절한다', () => {
        expect(hasImageSignature(withBytes([[0, [0x52, 0x49, 0x46, 0x46]]]), 'image/webp')).toBe(false)
    })

    test('길이가 짧으면 거절한다', () => {
        expect(hasImageSignature(new Uint8Array([0xff, 0xd8]), 'image/jpeg')).toBe(false)
    })
})

describe('buildUploadKey', () => {
    test('종류·연도·확장자로 키를 만든다', () => {
        expect(buildUploadKey({ kind: 'booking', year: '2026', mime: 'image/jpeg', uuid: SAMPLE_UUID })).toBe(
            `uploads/booking/2026/${SAMPLE_UUID}.jpg`,
        )
        expect(buildUploadKey({ kind: 'avatar', year: '2026', mime: 'image/avif', uuid: SAMPLE_UUID })).toBe(
            `uploads/avatar/2026/${SAMPLE_UUID}.avif`,
        )
    })
})
