'use client'

import { useState, type FC, type FormEvent } from 'react'
import {
    RICH_EDITOR_DIALOG_CANCEL,
    RICH_EDITOR_DIALOG_CONFIRM,
    RICH_EDITOR_LINK_DIALOG,
    RICH_EDITOR_YOUTUBE_DIALOG,
} from '@/features/editor/rich-editor.constant'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type RichEditorUrlDialogProps = {
    copy: typeof RICH_EDITOR_LINK_DIALOG | typeof RICH_EDITOR_YOUTUBE_DIALOG
    inputId: string
    initialUrl: string
    validate: (url: string) => boolean
    onClose: () => void
    onSubmit: (url: string) => void
}

export const RichEditorUrlDialog: FC<RichEditorUrlDialogProps> = ({ copy, inputId, initialUrl, validate, onClose, onSubmit }) => {
    const [url, setUrl] = useState(initialUrl)
    const [isInvalid, setIsInvalid] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmed = url.trim()
        if (!validate(trimmed)) {
            setIsInvalid(true)
            return
        }
        onSubmit(trimmed)
    }

    return (
        <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className='rounded-none'>
                <DialogHeader>
                    <DialogTitle>{copy.title}</DialogTitle>
                    <DialogDescription>{copy.description}</DialogDescription>
                </DialogHeader>
                <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1.5'>
                        <Label className='text-xs font-medium text-muted-foreground' htmlFor={inputId}>
                            {copy.label}
                        </Label>
                        <Input
                            id={inputId}
                            value={url}
                            placeholder={copy.placeholder}
                            aria-invalid={isInvalid}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                        {isInvalid && <p className='text-xs text-destructive'>{copy.invalid}</p>}
                    </div>
                    <div className='flex gap-px bg-background'>
                        <Button type='button' variant='cell' size='cell' onClick={onClose}>
                            {RICH_EDITOR_DIALOG_CANCEL}
                        </Button>
                        <Button type='submit' variant='cellPrimary' size='cell'>
                            {RICH_EDITOR_DIALOG_CONFIRM}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
