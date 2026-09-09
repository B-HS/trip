import { describe, expect, test } from 'bun:test'
import { RICH_TEXT_MAX_JSON_LENGTH } from '@/shared/constant/rich-text'
import {
    EMPTY_RICH_TEXT_DOCUMENT,
    isRichTextEmpty,
    parseRichTextDocument,
    richTextDocumentSchema,
    richTextPlainText,
    type RichTextDocument,
} from '@/shared/lib/rich-text-document'

const SUMMARY_LENGTH = 5

const paragraph = (text: string): RichTextDocument => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })

describe('parseRichTextDocument', () => {
    test('빈 문서 상수가 파싱을 통과한다', () => {
        expect(parseRichTextDocument(EMPTY_RICH_TEXT_DOCUMENT)).toEqual(EMPTY_RICH_TEXT_DOCUMENT)
    })

    test('제목·목록·링크 문서를 파싱한다', () => {
        const document = {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '제목' }] },
                {
                    type: 'bulletList',
                    content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '항목' }] }] }],
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '링크', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] }],
                },
            ],
        }
        expect(parseRichTextDocument(document)?.content?.length).toBe(3)
    })

    test('YouTube 노드를 파싱한다', () => {
        const document = { type: 'doc', content: [{ type: 'youtube', attrs: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } }] }
        expect(parseRichTextDocument(document)?.content?.[0]?.type).toBe('youtube')
    })

    test('알 수 없는 노드 타입은 null 을 반환한다', () => {
        expect(parseRichTextDocument({ type: 'doc', content: [{ type: 'script' }] })).toBeNull()
    })

    test('스키마에서 끈 노드와 마크는 null 을 반환한다', () => {
        expect(parseRichTextDocument({ type: 'doc', content: [{ type: 'horizontalRule' }] })).toBeNull()
        expect(
            parseRichTextDocument({
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '밑줄', marks: [{ type: 'underline' }] }] }],
            }),
        ).toBeNull()
    })

    test('최상위 형태가 doc 이 아니면 null 을 반환한다', () => {
        expect(parseRichTextDocument({ type: 'paragraph' })).toBeNull()
        expect(parseRichTextDocument([{ type: 'doc' }])).toBeNull()
        expect(parseRichTextDocument('doc')).toBeNull()
        expect(parseRichTextDocument(null)).toBeNull()
        expect(parseRichTextDocument(undefined)).toBeNull()
    })

    test('길이 상한을 넘으면 null 을 반환한다', () => {
        expect(parseRichTextDocument(paragraph('가'.repeat(RICH_TEXT_MAX_JSON_LENGTH)))).toBeNull()
    })

    test('알 수 없는 속성은 스키마 기본값으로 정규화한다', () => {
        const parsed = parseRichTextDocument({ type: 'doc', content: [{ type: 'paragraph', attrs: { onclick: 'alert(1)' } }] })
        expect(parsed).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
    })
})

describe('richTextDocumentSchema', () => {
    test('유효한 문서를 파싱 결과로 돌려준다', () => {
        expect(richTextDocumentSchema.parse(paragraph('안녕'))).toEqual(paragraph('안녕'))
    })

    test('유효하지 않은 문서는 한국어 메시지로 실패한다', () => {
        const result = richTextDocumentSchema.safeParse({ type: 'doc', content: [{ type: 'script' }] })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.message).toBe('본문 형식이 올바르지 않습니다.')
    })
})

describe('richTextPlainText', () => {
    test('블록을 공백으로 이어 붙인다', () => {
        const document = {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '제목' }] },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: '첫째 ' },
                        { type: 'text', text: '줄' },
                    ],
                },
            ],
        }
        expect(richTextPlainText(document)).toBe('제목 첫째 줄')
    })

    test('maxLength 로 잘라낸다', () => {
        expect(richTextPlainText(paragraph('열두글자가넘는본문'), SUMMARY_LENGTH)).toBe('열두글자가')
    })
})

describe('isRichTextEmpty', () => {
    test('빈 문서와 공백만 있는 문서는 비어 있다고 본다', () => {
        expect(isRichTextEmpty(EMPTY_RICH_TEXT_DOCUMENT)).toBe(true)
        expect(isRichTextEmpty(paragraph('   '))).toBe(true)
    })

    test('텍스트가 있으면 비어 있지 않다', () => {
        expect(isRichTextEmpty(paragraph('내용'))).toBe(false)
    })

    test('이미지나 YouTube 만 있어도 비어 있지 않다', () => {
        expect(isRichTextEmpty({ type: 'doc', content: [{ type: 'image', attrs: { src: 'https://cdn.example.com/a.png' } }] })).toBe(false)
        expect(isRichTextEmpty({ type: 'doc', content: [{ type: 'youtube', attrs: { src: 'https://youtu.be/dQw4w9WgXcQ' } }] })).toBe(false)
    })
})
