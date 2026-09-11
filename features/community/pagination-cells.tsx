import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'

const FIRST_PAGE = 1
const SINGLE_PAGE_COUNT = 1
const PAGE_STEP = 1

export type PaginationCellsProps = {
    page: number
    pageCount: number
    buildHref: (page: number) => string
}

export const PaginationCells: FC<PaginationCellsProps> = ({ page, pageCount, buildHref }) => {
    const t = useTranslations('community.pagination')
    if (pageCount <= SINGLE_PAGE_COUNT) return null

    return (
        <nav className='flex gap-px bg-background' aria-label={t('aria')}>
            {page <= FIRST_PAGE ? (
                <Button variant='cell' size='cell' disabled>
                    {t('prev')}
                </Button>
            ) : (
                <Button variant='cell' size='cell' asChild>
                    <Link href={buildHref(page - PAGE_STEP)}>{t('prev')}</Link>
                </Button>
            )}
            <p className='flex min-h-10 items-center bg-card px-4 font-mono text-xs text-muted-foreground tabular-nums'>
                {page} / {pageCount}
            </p>
            {page >= pageCount ? (
                <Button variant='cell' size='cell' disabled>
                    {t('next')}
                </Button>
            ) : (
                <Button variant='cell' size='cell' asChild>
                    <Link href={buildHref(page + PAGE_STEP)}>{t('next')}</Link>
                </Button>
            )}
        </nav>
    )
}
