'use client'

import type { FC } from 'react'
import { RichEditorUrlDialog } from '@/features/editor/rich-editor-url-dialog'
import { RICH_EDITOR_LINK_DIALOG } from '@/features/editor/rich-editor.constant'
import { RICH_TEXT_HTTP_URL_PATTERN } from '@/shared/constant/rich-text'

const LINK_URL_INPUT_ID = 'rich-editor-link-url'

type RichEditorLinkDialogProps = {
    initialUrl: string
    onClose: () => void
    onSubmit: (url: string) => void
}

export const RichEditorLinkDialog: FC<RichEditorLinkDialogProps> = ({ initialUrl, onClose, onSubmit }) => (
    <RichEditorUrlDialog
        copy={RICH_EDITOR_LINK_DIALOG}
        inputId={LINK_URL_INPUT_ID}
        initialUrl={initialUrl}
        validate={(url) => url === '' || RICH_TEXT_HTTP_URL_PATTERN.test(url)}
        onClose={onClose}
        onSubmit={onSubmit}
    />
)
