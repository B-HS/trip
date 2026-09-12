'use client'

import { isValidYoutubeUrl } from '@tiptap/extension-youtube'
import type { FC } from 'react'
import { RichEditorUrlDialog } from '@/features/editor/rich-editor-url-dialog'

const YOUTUBE_URL_INPUT_ID = 'rich-editor-youtube-url'

type RichEditorYoutubeDialogProps = {
    onClose: () => void
    onSubmit: (url: string) => void
}

export const RichEditorYoutubeDialog: FC<RichEditorYoutubeDialogProps> = ({ onClose, onSubmit }) => (
    <RichEditorUrlDialog
        kind='youtube'
        inputId={YOUTUBE_URL_INPUT_ID}
        initialUrl=''
        validate={(url) => isValidYoutubeUrl(url) !== null}
        onClose={onClose}
        onSubmit={onSubmit}
    />
)
