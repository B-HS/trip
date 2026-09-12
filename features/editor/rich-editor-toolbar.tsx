'use client'

import { useEditorState, type Editor } from '@tiptap/react'
import {
    BoldIcon,
    Heading2Icon,
    Heading3Icon,
    ImagePlusIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    PlayCircleIcon,
    QuoteIcon,
    RedoIcon,
    SquareCodeIcon,
    StrikethroughIcon,
    UndoIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC, ReactNode } from 'react'
import { RICH_TEXT_HEADING_LEVELS } from '@/shared/constant/rich-text'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const [HEADING_2_LEVEL, HEADING_3_LEVEL] = RICH_TEXT_HEADING_LEVELS

type RichEditorToolbarCell = {
    label: string
    hint?: string
    icon: ReactNode
    isActive?: boolean
    isDisabled: boolean
    onSelect: () => void
}

type RichEditorToolbarProps = {
    editor: Editor
    isUploadEnabled: boolean
    isUploading: boolean
    onOpenLink: () => void
    onOpenYoutube: () => void
    onPickImage: () => void
}

export const RichEditorToolbar: FC<RichEditorToolbarProps> = ({ editor, isUploadEnabled, isUploading, onOpenLink, onOpenYoutube, onPickImage }) => {
    const t = useTranslations('richEditor')
    const state = useEditorState({
        editor,
        selector: ({ editor: instance }) => ({
            isHeading2: instance.isActive('heading', { level: HEADING_2_LEVEL }),
            isHeading3: instance.isActive('heading', { level: HEADING_3_LEVEL }),
            isBold: instance.isActive('bold'),
            isItalic: instance.isActive('italic'),
            isStrike: instance.isActive('strike'),
            isBulletList: instance.isActive('bulletList'),
            isOrderedList: instance.isActive('orderedList'),
            isBlockquote: instance.isActive('blockquote'),
            isCodeBlock: instance.isActive('codeBlock'),
            isLink: instance.isActive('link'),
            canHeading2: instance.can().toggleHeading({ level: HEADING_2_LEVEL }),
            canHeading3: instance.can().toggleHeading({ level: HEADING_3_LEVEL }),
            canBold: instance.can().toggleBold(),
            canItalic: instance.can().toggleItalic(),
            canStrike: instance.can().toggleStrike(),
            canBulletList: instance.can().toggleBulletList(),
            canOrderedList: instance.can().toggleOrderedList(),
            canBlockquote: instance.can().toggleBlockquote(),
            canCodeBlock: instance.can().toggleCodeBlock(),
            canUndo: instance.can().undo(),
            canRedo: instance.can().redo(),
        }),
    })

    const resolveImageHint = () => {
        if (!isUploadEnabled) return t('uploadDisabled')
        if (isUploading) return t('uploading')
        return t('toolbar.image')
    }
    const cells: RichEditorToolbarCell[] = [
        {
            label: t('toolbar.heading2'),
            icon: <Heading2Icon />,
            isActive: state.isHeading2,
            isDisabled: !state.canHeading2,
            onSelect: () => editor.chain().focus().toggleHeading({ level: HEADING_2_LEVEL }).run(),
        },
        {
            label: t('toolbar.heading3'),
            icon: <Heading3Icon />,
            isActive: state.isHeading3,
            isDisabled: !state.canHeading3,
            onSelect: () => editor.chain().focus().toggleHeading({ level: HEADING_3_LEVEL }).run(),
        },
        {
            label: t('toolbar.bold'),
            icon: <BoldIcon />,
            isActive: state.isBold,
            isDisabled: !state.canBold,
            onSelect: () => editor.chain().focus().toggleBold().run(),
        },
        {
            label: t('toolbar.italic'),
            icon: <ItalicIcon />,
            isActive: state.isItalic,
            isDisabled: !state.canItalic,
            onSelect: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: t('toolbar.strike'),
            icon: <StrikethroughIcon />,
            isActive: state.isStrike,
            isDisabled: !state.canStrike,
            onSelect: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            label: t('toolbar.bulletList'),
            icon: <ListIcon />,
            isActive: state.isBulletList,
            isDisabled: !state.canBulletList,
            onSelect: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: t('toolbar.orderedList'),
            icon: <ListOrderedIcon />,
            isActive: state.isOrderedList,
            isDisabled: !state.canOrderedList,
            onSelect: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: t('toolbar.blockquote'),
            icon: <QuoteIcon />,
            isActive: state.isBlockquote,
            isDisabled: !state.canBlockquote,
            onSelect: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            label: t('toolbar.codeBlock'),
            icon: <SquareCodeIcon />,
            isActive: state.isCodeBlock,
            isDisabled: !state.canCodeBlock,
            onSelect: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
            label: t('toolbar.link'),
            icon: <LinkIcon />,
            isActive: state.isLink,
            isDisabled: false,
            onSelect: onOpenLink,
        },
        {
            label: t('toolbar.image'),
            hint: resolveImageHint(),
            icon: <ImagePlusIcon />,
            isActive: undefined,
            isDisabled: !isUploadEnabled || isUploading,
            onSelect: onPickImage,
        },
        {
            label: t('toolbar.youtube'),
            icon: <PlayCircleIcon />,
            isActive: undefined,
            isDisabled: false,
            onSelect: onOpenYoutube,
        },
        {
            label: t('toolbar.undo'),
            icon: <UndoIcon />,
            isActive: undefined,
            isDisabled: !state.canUndo,
            onSelect: () => editor.chain().focus().undo().run(),
        },
        {
            label: t('toolbar.redo'),
            icon: <RedoIcon />,
            isActive: undefined,
            isDisabled: !state.canRedo,
            onSelect: () => editor.chain().focus().redo().run(),
        },
    ]

    return (
        <div className='flex flex-wrap gap-px bg-background'>
            {cells.map((cell) => (
                <Tooltip key={cell.label}>
                    <TooltipTrigger asChild>
                        <span className='flex'>
                            <Button
                                type='button'
                                variant='cell'
                                size='cellIcon'
                                aria-label={cell.label}
                                aria-pressed={cell.isActive}
                                disabled={cell.isDisabled}
                                onClick={cell.onSelect}>
                                {cell.icon}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>{cell.hint ?? cell.label}</TooltipContent>
                </Tooltip>
            ))}
        </div>
    )
}
