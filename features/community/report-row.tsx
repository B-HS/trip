import dayjs from 'dayjs'
import type { FC } from 'react'
import type { ReportView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import {
    BLOCK_LABEL,
    DISMISS_LABEL,
    HIDE_LABEL,
    POST_DATE_FORMAT,
    REPORT_KIND_LABEL,
    REPORT_REASON_LABEL,
    RESTORE_LABEL,
    UNBAN_LABEL,
} from '@/features/community/community.constant'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

export type ReportRowProps = {
    report: ReportView
    isPending: boolean
    onHide: () => void
    onDismiss: () => void
    onBan: () => void
    onUnban: () => void
    onRestore: () => void
}

export const ReportRow: FC<ReportRowProps> = ({ report, isPending, onHide, onDismiss, onBan, onUnban, onRestore }) => (
    <article className='flex flex-col gap-px'>
        <div className='flex flex-col gap-1 bg-card p-3'>
            <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                <Badge variant='secondary'>{REPORT_KIND_LABEL[report.kind]}</Badge>
                <Badge variant='outline'>{REPORT_REASON_LABEL[report.reason]}</Badge>
                <time className='tabular-nums' dateTime={report.createdAt}>
                    {dayjs(report.createdAt).format(POST_DATE_FORMAT)}
                </time>
            </div>
            <p className='text-sm break-keep'>{report.targetLabel ?? '(대상 없음)'}</p>
            {report.memo !== null && <p className='text-xs break-keep whitespace-pre-wrap text-muted-foreground'>{report.memo}</p>}
            <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                <span>신고자</span>
                <AuthorChip author={report.reporter} />
            </div>
        </div>
        <div className='flex flex-wrap items-stretch gap-px bg-background'>
            {report.kind !== 'user' && (
                <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={onHide}>
                    {HIDE_LABEL}
                </Button>
            )}
            <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onDismiss}>
                {DISMISS_LABEL}
            </Button>
            <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={onBan}>
                {BLOCK_LABEL}
            </Button>
            {report.kind === 'user' && (
                <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onUnban}>
                    {UNBAN_LABEL}
                </Button>
            )}
            {report.kind === 'post' && (
                <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onRestore}>
                    {RESTORE_LABEL}
                </Button>
            )}
            <div aria-hidden className='min-w-0 flex-1 bg-card' />
        </div>
    </article>
)
