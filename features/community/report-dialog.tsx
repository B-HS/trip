'use client'

import { useState, type FC, type FormEvent } from 'react'
import {
    REPORT_CANCEL_LABEL,
    REPORT_DESCRIPTION,
    REPORT_LABEL,
    REPORT_REASON_LABEL,
    REPORT_TITLE,
    REPORTING_LABEL,
} from '@/features/community/community.constant'
import { REPORT_MEMO_MAX_LENGTH, REPORT_REASONS, type ReportReason } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

const REASON_PLACEHOLDER = '사유를 선택해 주세요.'
const MEMO_PLACEHOLDER = '추가 내용을 남길 수 있습니다. (선택)'
const REASON_LABEL = '신고 사유'
const MEMO_LABEL = '메모'
const REASON_REQUIRED_ERROR = '신고 사유를 선택해 주세요.'

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
    const [reason, setReason] = useState<ReportReason | null>(null)
    const [memo, setMemo] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (reason === null) {
            setError(REASON_REQUIRED_ERROR)
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
                        <DialogTitle>{REPORT_TITLE}</DialogTitle>
                        <DialogDescription>{REPORT_DESCRIPTION}</DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col gap-2 py-2'>
                        <label className='text-xs font-medium' htmlFor='report-reason'>
                            {REASON_LABEL}
                        </label>
                        <Select
                            value={reason ?? undefined}
                            onValueChange={(value) => {
                                setReason(value as ReportReason)
                                setError(null)
                            }}>
                            <SelectTrigger id='report-reason' className='w-full'>
                                <SelectValue placeholder={REASON_PLACEHOLDER} />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {REPORT_REASON_LABEL[item]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error !== null && <p className='text-xs text-destructive'>{error}</p>}
                        <label className='text-xs font-medium' htmlFor='report-memo'>
                            {MEMO_LABEL}
                        </label>
                        <Textarea
                            id='report-memo'
                            className='min-h-24'
                            maxLength={REPORT_MEMO_MAX_LENGTH}
                            placeholder={MEMO_PLACEHOLDER}
                            value={memo}
                            onChange={(event) => setMemo(event.target.value)}
                        />
                    </div>
                    <DialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onClose}>
                            {REPORT_CANCEL_LABEL}
                        </Button>
                        <Button type='submit' variant='cellDestructive' size='cell' disabled={isPending}>
                            {isPending ? REPORTING_LABEL : REPORT_LABEL}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
