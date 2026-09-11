import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { ReportView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { POST_DATE_FORMAT } from '@/features/community/community.constant'
import { translateMessage } from '@/shared/lib/message-key'
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

export const ReportRow: FC<ReportRowProps> = ({ report, isPending, onHide, onDismiss, onBan, onUnban, onRestore }) => {
    const t = useTranslations('community')

    return (
        <article className='flex flex-col gap-px'>
            <div className='flex flex-col gap-1 bg-card p-3'>
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                    <Badge variant='secondary'>{t(`report.kinds.${report.kind}`)}</Badge>
                    <Badge variant='outline'>{t(`report.reasons.${report.reason}`)}</Badge>
                    <time className='tabular-nums' dateTime={report.createdAt}>
                        {dayjs(report.createdAt).format(POST_DATE_FORMAT)}
                    </time>
                </div>
                <p className='text-sm break-keep'>{translateMessage(t, report.targetLabel ?? t('moderation.noTarget'))}</p>
                {report.memo !== null && <p className='text-xs break-keep whitespace-pre-wrap text-muted-foreground'>{report.memo}</p>}
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                    <span>{t('moderation.reporter')}</span>
                    <AuthorChip author={report.reporter} />
                </div>
            </div>
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                {report.kind !== 'user' && (
                    <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={onHide}>
                        {t('moderation.hide')}
                    </Button>
                )}
                <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onDismiss}>
                    {t('moderation.dismiss')}
                </Button>
                <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={onBan}>
                    {t('moderation.block')}
                </Button>
                {report.kind === 'user' && (
                    <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onUnban}>
                        {t('moderation.unban')}
                    </Button>
                )}
                {report.kind === 'post' && (
                    <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onRestore}>
                        {t('moderation.restore')}
                    </Button>
                )}
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        </article>
    )
}
