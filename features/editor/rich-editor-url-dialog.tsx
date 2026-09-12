'use client'

import { useState, type FC, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type RichEditorUrlDialogProps = {
    kind: 'link' | 'youtube'
    inputId: string
    initialUrl: string
    validate: (url: string) => boolean
    onClose: () => void
    onSubmit: (url: string) => void
}

export const RichEditorUrlDialog: FC<RichEditorUrlDialogProps> = ({ kind, inputId, initialUrl, validate, onClose, onSubmit }) => {
    const t = useTranslations('richEditor')
    const [url, setUrl] = useState(initialUrl)
    const [isInvalid, setIsInvalid] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        event.stopPropagation()
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
                    <DialogTitle>{t(`${kind}.title`)}</DialogTitle>
                    <DialogDescription>{t(`${kind}.description`)}</DialogDescription>
                </DialogHeader>
                <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1.5'>
                        <Label className='text-xs font-medium text-muted-foreground' htmlFor={inputId}>
                            {t(`${kind}.label`)}
                        </Label>
                        <Input
                            id={inputId}
                            value={url}
                            placeholder={t(`${kind}.placeholder`)}
                            aria-invalid={isInvalid}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                        {isInvalid && <p className='text-xs text-destructive'>{t(`${kind}.invalid`)}</p>}
                    </div>
                    <div className='flex gap-px bg-background'>
                        <Button type='button' variant='cell' size='cell' onClick={onClose}>
                            {t('cancel')}
                        </Button>
                        <Button type='submit' variant='cellPrimary' size='cell'>
                            {t('confirm')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
