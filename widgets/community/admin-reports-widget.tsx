'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC } from 'react'
import {
    useOpenReports,
    useBanReportedUser,
    useDismissReport,
    useHideReportTarget,
    useRestorePost,
    useUnbanUser,
} from '@/entities/community/community.query'
import { ReportRow } from '@/features/community/report-row'

import { Button } from '@/shared/ui/button'

const FIRST_PAGE = 1
const PAGE_STEP = 1

export type AdminReportsWidgetProps = {
    initialPage: number
}

export const AdminReportsWidget: FC<AdminReportsWidgetProps> = ({ initialPage }) => {
    const t = useTranslations('community.admin')
    const tPagination = useTranslations('community.pagination')
    const [page, setPage] = useState(initialPage)
    const reports = useOpenReports(page)
    const hideTarget = useHideReportTarget(page)
    const dismissReport = useDismissReport(page)
    const banUser = useBanReportedUser(page)
    const unbanUser = useUnbanUser(page)
    const restorePost = useRestorePost(page)

    const isPending = hideTarget.isPending || dismissReport.isPending || banUser.isPending || unbanUser.isPending || restorePost.isPending
    const data = reports.data
    const items = data?.items ?? []
    const pageCount = data?.pageCount ?? 1

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>ADMIN</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>
                    {t('description')} <span className='font-mono tabular-nums'>{t('total', { count: data?.total ?? 0 })}</span>
                </p>
            </section>
            {reports.isError ? (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <p className='flex min-h-10 min-w-0 flex-1 items-center bg-card px-4 text-xs text-destructive'>{t('error')}</p>
                    <Button type='button' variant='cell' size='cell' onClick={() => reports.refetch()}>
                        {t('retry')}
                    </Button>
                </div>
            ) : reports.isPending ? (
                <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{t('loading')}</p>
            ) : items.length === 0 ? (
                <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{t('empty')}</p>
            ) : (
                <ul className='flex flex-col gap-px bg-background'>
                    {items.map((report) => (
                        <li key={report.id}>
                            <ReportRow
                                report={report}
                                isPending={isPending}
                                onHide={() => hideTarget.mutate(report.id)}
                                onDismiss={() => dismissReport.mutate(report.id)}
                                onBan={() => banUser.mutate(report.id)}
                                onUnban={() => unbanUser.mutate(report.targetId)}
                                onRestore={() => restorePost.mutate(report.targetId)}
                            />
                        </li>
                    ))}
                </ul>
            )}
            {pageCount > 1 && (
                <nav className='flex gap-px bg-background' aria-label={tPagination('aria')}>
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        disabled={page <= FIRST_PAGE || reports.isPending}
                        onClick={() => setPage((p) => p - PAGE_STEP)}>
                        {tPagination('prev')}
                    </Button>
                    <p className='flex min-h-10 items-center bg-card px-4 font-mono text-xs text-muted-foreground tabular-nums'>
                        {page} / {pageCount}
                    </p>
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        disabled={page >= pageCount || reports.isPending}
                        onClick={() => setPage((p) => p + PAGE_STEP)}>
                        {tPagination('next')}
                    </Button>
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </nav>
            )}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
