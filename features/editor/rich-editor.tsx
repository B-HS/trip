'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { useTranslations } from 'next-intl'
import { useRef, useState, type ChangeEvent, type FC } from 'react'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { RichEditorLinkDialog } from '@/features/editor/rich-editor-link-dialog'
import { RichEditorToolbar } from '@/features/editor/rich-editor-toolbar'
import { RichEditorYoutubeDialog } from '@/features/editor/rich-editor-youtube-dialog'
import { RICH_TEXT_CLASS, RICH_TEXT_YOUTUBE_HEIGHT, RICH_TEXT_YOUTUBE_WIDTH } from '@/shared/constant/rich-text'
import { UPLOAD_IMAGE_ACCEPT } from '@/shared/constant/upload'
import { EMPTY_RICH_TEXT_DOCUMENT, toPlainDocument, type RichTextDocument } from '@/shared/lib/rich-text-document'
import { createRichTextExtensions } from '@/shared/lib/rich-text-extensions'
import { cn } from '@/shared/lib/utils'

const RICH_EDITOR_EXTENSIONS = createRichTextExtensions()

const RICH_EDITOR_CONTENT_CLASS = 'min-h-64 bg-card p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

type RichEditorProps = {
    content: RichTextDocument | null
    onChange: (doc: RichTextDocument) => void
    label: string
    isUploadEnabled: boolean
    isUploading: boolean
    isInvalid?: boolean
    errorId?: string
    onUploadImage: (file: File) => Promise<UploadedImage | null>
    className?: string
}

export const RichEditor: FC<RichEditorProps> = ({
    content,
    onChange,
    label,
    isUploadEnabled,
    isUploading,
    isInvalid = false,
    errorId,
    onUploadImage,
    className,
}) => {
    const t = useTranslations('richEditor')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [linkUrl, setLinkUrl] = useState<string | null>(null)
    const [isYoutubeOpen, setIsYoutubeOpen] = useState(false)

    const describedBy: Record<string, string> = isInvalid && errorId !== undefined ? { 'aria-describedby': errorId } : {}
    const editor = useEditor({
        extensions: RICH_EDITOR_EXTENSIONS,
        content: content ?? EMPTY_RICH_TEXT_DOCUMENT,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                'class': cn(RICH_TEXT_CLASS, RICH_EDITOR_CONTENT_CLASS),
                'aria-label': label,
                'aria-invalid': String(isInvalid),
                ...describedBy,
            },
        },
        onUpdate: ({ editor: instance }) => onChange(toPlainDocument(instance.getJSON())),
    })

    const handleOpenLink = () => {
        const href: unknown = editor?.getAttributes('link').href
        setLinkUrl(typeof href === 'string' ? href : '')
    }
    const handleLinkSubmit = (url: string) => {
        setLinkUrl(null)
        if (editor === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    const handleYoutubeSubmit = (url: string) => {
        setIsYoutubeOpen(false)
        editor?.chain().focus().setYoutubeVideo({ src: url, width: RICH_TEXT_YOUTUBE_WIDTH, height: RICH_TEXT_YOUTUBE_HEIGHT }).run()
    }
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        const uploaded = await onUploadImage(file)
        if (uploaded === null) return
        editor?.chain().focus().setImage({ src: uploaded.url, alt: '' }).run()
    }

    return (
        <div className={cn('flex flex-col gap-px bg-background', className)}>
            {editor !== null && (
                <RichEditorToolbar
                    editor={editor}
                    isUploadEnabled={isUploadEnabled}
                    isUploading={isUploading}
                    onOpenLink={handleOpenLink}
                    onOpenYoutube={() => setIsYoutubeOpen(true)}
                    onPickImage={() => fileInputRef.current?.click()}
                />
            )}
            <EditorContent editor={editor} />
            <input
                ref={fileInputRef}
                className='hidden'
                type='file'
                aria-label={t('fileInput')}
                accept={UPLOAD_IMAGE_ACCEPT}
                onChange={handleFileChange}
            />
            {linkUrl !== null && <RichEditorLinkDialog initialUrl={linkUrl} onClose={() => setLinkUrl(null)} onSubmit={handleLinkSubmit} />}
            {isYoutubeOpen && <RichEditorYoutubeDialog onClose={() => setIsYoutubeOpen(false)} onSubmit={handleYoutubeSubmit} />}
        </div>
    )
}
