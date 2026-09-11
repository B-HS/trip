'use client'

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
import { NEXT_PAGE_LABEL, PAGINATION_LABEL, PREV_PAGE_LABEL } from '@/features/community/community.constant'
import { Button } from '@/shared/ui/button'

const FIRST_PAGE = 1
const PAGE_STEP = 1
const EMPTY_REPORT_LABEL = '처리 대기 중인 신고가 없습니다.'
const LOADING_REPORT_LABEL = '신고를 불러오는 중입니다.'
const ERROR_REPORT_LABEL = '신고를 불러오지 못했습니다.'
const RETRY_LABEL = '다시 시도'

export type AdminReportsWidgetProps = {
    initialPage: number
}

export const AdminReportsWidget: FC<AdminReportsWidgetProps> = ({ initialPage }) => {
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
                <h1 className='text-2xl font-semibold tracking-tight'>신고 관리</h1>
                <p className='text-xs text-muted-foreground'>
                    처리 대기 중인 신고입니다. <span className='font-mono tabular-nums'>전체 {data?.total ?? 0}건</span>
                </p>
            </section>
            {reports.isError ? (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <p className='flex min-h-10 min-w-0 flex-1 items-center bg-card px-4 text-xs text-destructive'>{ERROR_REPORT_LABEL}</p>
                    <Button type='button' variant='cell' size='cell' onClick={() => reports.refetch()}>
                        {RETRY_LABEL}
                    </Button>
                </div>
            ) : reports.isPending ? (
                <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{LOADING_REPORT_LABEL}</p>
            ) : items.length === 0 ? (
                <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{EMPTY_REPORT_LABEL}</p>
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
                <nav className='flex gap-px bg-background' aria-label={PAGINATION_LABEL}>
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        disabled={page <= FIRST_PAGE || reports.isPending}
                        onClick={() => setPage((p) => p - PAGE_STEP)}>
                        {PREV_PAGE_LABEL}
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
                        {NEXT_PAGE_LABEL}
                    </Button>
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </nav>
            )}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
