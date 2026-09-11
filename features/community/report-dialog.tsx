'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC, type FormEvent } from 'react'
import { REPORT_MEMO_MAX_LENGTH, REPORT_REASONS, type ReportReason } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

export type ReportFormValues = {
    reason: ReportReason
    memo: string | null
}

export type ReportDialogProps = {
    open: boolean
    isPending: boolean
    onClose: () => void
    onSubmit: (values: ReportFormValues) => void
}

export const ReportDialog: FC<ReportDialogProps> = ({ open, isPending, onClose, onSubmit }) => {
    const t = useTranslations('community.report')
    const tMod = useTranslations('community.moderation')
    const [reason, setReason] = useState<ReportReason | null>(null)
    const [memo, setMemo] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (reason === null) {
            setError('validation.reportReasonRequired')
            return
        }
        setError(null)
        const trimmed = memo.trim()
        onSubmit({ reason, memo: trimmed.length > 0 ? trimmed : null })
        setReason(null)
        setMemo('')
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className='rounded-none'>
                <form onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>{tMod('title')}</DialogTitle>
                        <DialogDescription>{tMod('description')}</DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col gap-2 py-2'>
                        <label className='text-xs font-medium' htmlFor='report-reason'>
                            {t('reasonLabel')}
                        </label>
                        <Select
                            value={reason ?? undefined}
                            onValueChange={(value) => {
                                setReason(value as ReportReason)
                                setError(null)
                            }}>
                            <SelectTrigger id='report-reason' className='w-full'>
                                <SelectValue placeholder={t('reasonPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {t(`reasons.${item}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error !== null && <p className='text-xs text-destructive'>{error}</p>}
                        <label className='text-xs font-medium' htmlFor='report-memo'>
                            {t('memoLabel')}
                        </label>
                        <Textarea
                            id='report-memo'
                            className='min-h-24'
                            maxLength={REPORT_MEMO_MAX_LENGTH}
                            placeholder={t('memoPlaceholder')}
                            value={memo}
                            onChange={(event) => setMemo(event.target.value)}
                        />
                    </div>
                    <DialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onClose}>
                            {tMod('cancel')}
                        </Button>
                        <Button type='submit' variant='cellDestructive' size='cell' disabled={isPending}>
                            {isPending ? tMod('reporting') : tMod('report')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
