import { getSchema } from '@tiptap/core'
import { Image } from '@tiptap/extension-image'
import { Youtube } from '@tiptap/extension-youtube'
import { StarterKit } from '@tiptap/starter-kit'
import {
    RICH_TEXT_HEADING_LEVELS,
    RICH_TEXT_HTTP_URL_PATTERN,
    RICH_TEXT_LINK_PROTOCOLS,
    RICH_TEXT_LINK_REL,
    RICH_TEXT_LINK_TARGET,
    RICH_TEXT_YOUTUBE_HEIGHT,
    RICH_TEXT_YOUTUBE_WIDTH,
} from '@/shared/constant/rich-text'

export const createRichTextExtensions = () => [
    StarterKit.configure({
        code: false,
        horizontalRule: false,
        underline: false,
        heading: { levels: [...RICH_TEXT_HEADING_LEVELS] },
        link: {
            openOnClick: false,
            autolink: true,
            protocols: [...RICH_TEXT_LINK_PROTOCOLS],
            isAllowedUri: (url) => RICH_TEXT_HTTP_URL_PATTERN.test(url),
            HTMLAttributes: { rel: RICH_TEXT_LINK_REL, target: RICH_TEXT_LINK_TARGET },
        },
    }),
    Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
    Youtube.configure({
        nocookie: true,
        allowFullscreen: true,
        controls: true,
        modestBranding: true,
        width: RICH_TEXT_YOUTUBE_WIDTH,
        height: RICH_TEXT_YOUTUBE_HEIGHT,
    }),
]

export const createRichTextSchema = () => getSchema(createRichTextExtensions())
