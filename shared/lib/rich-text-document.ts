import type { JSONContent } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { z } from 'zod'
import { RICH_TEXT_DOC_TYPE, RICH_TEXT_MAX_JSON_LENGTH, RICH_TEXT_MEDIA_NODE_TYPES } from '@/shared/constant/rich-text'
import { createRichTextSchema } from '@/shared/lib/rich-text-extensions'

const WHITESPACE_PATTERN = /\s+/g
const RICH_TEXT_DOCUMENT_ISSUE = '본문 형식이 올바르지 않습니다.'

export type RichTextDocument = JSONContent

export const EMPTY_RICH_TEXT_DOCUMENT: RichTextDocument = { type: RICH_TEXT_DOC_TYPE, content: [{ type: 'paragraph' }] }

const isRichTextDocumentShape = (input: unknown): input is RichTextDocument =>
    typeof input === 'object' && input !== null && !Array.isArray(input) && 'type' in input && input.type === RICH_TEXT_DOC_TYPE

export const parseRichTextDocument = (input: unknown) => {
    try {
        if (JSON.stringify(input).length > RICH_TEXT_MAX_JSON_LENGTH) return null
        if (!isRichTextDocumentShape(input)) return null
        const node = ProseMirrorNode.fromJSON(createRichTextSchema(), input)
        node.check()
        const parsed: RichTextDocument = node.toJSON()
        return parsed
    } catch {
        return null
    }
}

export const richTextDocumentSchema = z.unknown().transform((input, ctx) => {
    const parsed = parseRichTextDocument(input)
    if (parsed === null) {
        ctx.addIssue(RICH_TEXT_DOCUMENT_ISSUE)
        return z.NEVER
    }
    return parsed
})

const nodeText = (node: RichTextDocument): string => {
    if (typeof node.text === 'string') return node.text
    const children = node.content ?? []
    return children.map(nodeText).join(children.some((child) => typeof child.text === 'string') ? '' : ' ')
}

const hasMediaNode = (node: RichTextDocument): boolean =>
    RICH_TEXT_MEDIA_NODE_TYPES.some((type) => type === node.type) || (node.content ?? []).some(hasMediaNode)

export const toPlainDocument = (doc: RichTextDocument): RichTextDocument => JSON.parse(JSON.stringify(doc))

export const richTextPlainText = (doc: RichTextDocument, maxLength?: number) => {
    const text = nodeText(doc).replace(WHITESPACE_PATTERN, ' ').trim()
    return maxLength === undefined ? text : text.slice(0, maxLength)
}

export const isRichTextEmpty = (doc: RichTextDocument) => richTextPlainText(doc).length === 0 && !hasMediaNode(doc)
