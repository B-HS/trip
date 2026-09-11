import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { findPublicTripPage } from '@/entities/trip/trip.repository.explore'
import { PaginationCells } from '@/features/community/pagination-cells'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { EXPLORE_SORTS, PAGE_PARAM, SORT_PARAM, type ExploreSort } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'

export type ExploreListProps = {
    sort: ExploreSort
    page: number
}

export const ExploreList = async ({ sort, page }: ExploreListProps) => {
    const t = await getTranslations('community.explore')
    const tEmpty = await getTranslations('community.empty')
    const trips = await findPublicTripPage({ sort, page })

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>EXPLORE</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </section>
            <nav className='flex flex-wrap items-stretch gap-px bg-background' aria-label={t('sortAria')}>
                {EXPLORE_SORTS.map((item) => (
                    <Button key={item} variant='cell' size='cell' asChild>
                        <Link href={`?${SORT_PARAM}=${item}`} aria-current={item === sort ? 'page' : undefined}>
                            {t(item)}
                        </Link>
                    </Button>
                ))}
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </nav>
            <PublicTripGrid trips={trips.items} emptyLabel={tEmpty('trip')} />
            <PaginationCells
                page={trips.page}
                pageCount={trips.pageCount}
                buildHref={(nextPage) => `?${SORT_PARAM}=${sort}&${PAGE_PARAM}=${nextPage}`}
            />
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
