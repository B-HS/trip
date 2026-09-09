export const RICH_TEXT_CLASS = 'rich-text'

export const RICH_TEXT_DOC_TYPE = 'doc'

export const RICH_TEXT_HEADING_LEVELS = [2, 3] as const

export const RICH_TEXT_MEDIA_NODE_TYPES = ['image', 'youtube'] as const

export const RICH_TEXT_YOUTUBE_WIDTH = 640
export const RICH_TEXT_YOUTUBE_HEIGHT = 360

export const RICH_TEXT_YOUTUBE_EMBED_PREFIXES = ['https://www.youtube.com/embed/', 'https://www.youtube-nocookie.com/embed/'] as const

export const RICH_TEXT_LINK_PROTOCOLS = ['http', 'https'] as const
export const RICH_TEXT_HTTP_URL_PATTERN = /^https?:\/\//i
export const RICH_TEXT_LINK_REL = 'noopener noreferrer'
export const RICH_TEXT_LINK_TARGET = '_blank'

export const RICH_TEXT_IFRAME_ATTRIBUTES = ['src', 'width', 'height', 'allowfullscreen', 'allow', 'frameborder', 'title', 'loading'] as const

export const RICH_TEXT_ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'img',
    'div',
    'iframe',
    ...RICH_TEXT_HEADING_LEVELS.map((level) => `h${level}`),
]

export const RICH_TEXT_ALLOWED_ATTRIBUTES = [...RICH_TEXT_IFRAME_ATTRIBUTES, 'href', 'target', 'rel', 'alt', 'start', 'type']

export const RICH_TEXT_MAX_JSON_LENGTH = 200_000
