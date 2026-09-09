import 'server-only'
import { generateHTML } from '@tiptap/html'
import type { RichTextDocument } from '@/shared/lib/rich-text-document'
import { createRichTextExtensions } from '@/shared/lib/rich-text-extensions'
import { sanitizeRichTextHtml } from '@/shared/lib/rich-text-sanitize'

export const renderRichTextHtml = (doc: RichTextDocument) => sanitizeRichTextHtml(generateHTML(doc, createRichTextExtensions()))
