import type { FC } from 'react'
import { RICH_TEXT_CLASS } from '@/shared/constant/rich-text'
import type { SanitizedRichTextHtml } from '@/shared/lib/rich-text-sanitize'
import { cn } from '@/shared/lib/utils'

type RichTextContentProps = {
    html: SanitizedRichTextHtml
    className?: string
}

export const RichTextContent: FC<RichTextContentProps> = ({ html, className }) => (
    <div className={cn(RICH_TEXT_CLASS, className)} dangerouslySetInnerHTML={{ __html: html }} />
)
