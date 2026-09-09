import DOMPurify, { type Config, type ElementHook, type UponSanitizeElementHook } from 'isomorphic-dompurify'
import {
    RICH_TEXT_ALLOWED_ATTRIBUTES,
    RICH_TEXT_ALLOWED_TAGS,
    RICH_TEXT_HTTP_URL_PATTERN,
    RICH_TEXT_LINK_REL,
    RICH_TEXT_LINK_TARGET,
    RICH_TEXT_YOUTUBE_EMBED_PREFIXES,
} from '@/shared/constant/rich-text'

export type SanitizedRichTextHtml = string & { readonly __sanitizedRichText: true }

const SANITIZE_CONFIG = { ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS, ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTRIBUTES } satisfies Config

const isElementNode = (node: Node): node is Element => 'getAttribute' in node

const isYoutubeEmbedSource = (src: string) => RICH_TEXT_YOUTUBE_EMBED_PREFIXES.some((prefix) => src.toLowerCase().startsWith(prefix))

const dropUnsafeMedia: UponSanitizeElementHook = (node, data) => {
    if (!isElementNode(node)) return
    if (data.tagName === 'iframe' && !isYoutubeEmbedSource(node.getAttribute('src') ?? '')) node.parentNode?.removeChild(node)
    if (data.tagName === 'img' && !RICH_TEXT_HTTP_URL_PATTERN.test(node.getAttribute('src') ?? '')) node.parentNode?.removeChild(node)
}

const enforceLinkPolicy: ElementHook = (node) => {
    if (node.tagName.toLowerCase() !== 'a') return
    const href = node.getAttribute('href')
    if (href === null || !RICH_TEXT_HTTP_URL_PATTERN.test(href)) {
        node.removeAttribute('href')
        node.removeAttribute('target')
        node.removeAttribute('rel')
        return
    }
    node.setAttribute('rel', RICH_TEXT_LINK_REL)
    node.setAttribute('target', RICH_TEXT_LINK_TARGET)
}

export const sanitizeRichTextHtml = (html: string) => {
    DOMPurify.addHook('uponSanitizeElement', dropUnsafeMedia)
    DOMPurify.addHook('afterSanitizeAttributes', enforceLinkPolicy)
    try {
        return DOMPurify.sanitize(html, SANITIZE_CONFIG) as SanitizedRichTextHtml
    } finally {
        DOMPurify.removeHook('uponSanitizeElement', dropUnsafeMedia)
        DOMPurify.removeHook('afterSanitizeAttributes', enforceLinkPolicy)
    }
}
