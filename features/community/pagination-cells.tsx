import type { Route } from 'next'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { NEXT_PAGE_LABEL, PAGINATION_LABEL, PREV_PAGE_LABEL } from '@/features/community/community.constant'
import { Button } from '@/shared/ui/button'

const FIRST_PAGE = 1
const SINGLE_PAGE_COUNT = 1
const PAGE_STEP = 1

export type PaginationCellsProps = {
    page: number
    pageCount: number
    buildHref: (page: number) => Route
}

export const PaginationCells: FC<PaginationCellsProps> = ({ page, pageCount, buildHref }) => {
    if (pageCount <= SINGLE_PAGE_COUNT) return null

    return (
        <nav className='flex gap-px bg-background' aria-label={PAGINATION_LABEL}>
            {page <= FIRST_PAGE ? (
                <Button variant='cell' size='cell' disabled>
                    {PREV_PAGE_LABEL}
                </Button>
            ) : (
                <Button variant='cell' size='cell' asChild>
                    <Link href={buildHref(page - PAGE_STEP)}>{PREV_PAGE_LABEL}</Link>
                </Button>
            )}
            <p className='flex min-h-10 items-center bg-card px-4 font-mono text-xs text-muted-foreground tabular-nums'>
                {page} / {pageCount}
            </p>
            {page >= pageCount ? (
                <Button variant='cell' size='cell' disabled>
                    {NEXT_PAGE_LABEL}
                </Button>
            ) : (
                <Button variant='cell' size='cell' asChild>
                    <Link href={buildHref(page + PAGE_STEP)}>{NEXT_PAGE_LABEL}</Link>
                </Button>
            )}
        </nav>
    )
}
