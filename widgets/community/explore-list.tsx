import Link from 'next/link'
import { findPublicTripPage } from '@/entities/trip/trip.repository.explore'
import { PaginationCells } from '@/features/community/pagination-cells'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { EMPTY_TRIP_LABEL, EXPLORE_SORTS, PAGE_PARAM, SORT_PARAM, type ExploreSort } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'

export type ExploreListProps = {
    sort: ExploreSort
    page: number
}

const SORT_LABEL = { recent: '최신순', popular: '인기순' } as const satisfies Record<ExploreSort, string>
const SORT_NAV_LABEL = '정렬 방식'

export const ExploreList = async ({ sort, page }: ExploreListProps) => {
    const trips = await findPublicTripPage({ sort, page })

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>EXPLORE</p>
                <h1 className='text-2xl font-semibold tracking-tight'>탐색</h1>
                <p className='text-xs text-muted-foreground'>공개된 여행 일정을 둘러봅니다</p>
            </section>
            <nav className='flex flex-wrap items-stretch gap-px bg-background' aria-label={SORT_NAV_LABEL}>
                {EXPLORE_SORTS.map((item) => (
                    <Button key={item} variant='cell' size='cell' asChild>
                        <Link href={`?${SORT_PARAM}=${item}`} aria-current={item === sort ? 'page' : undefined}>
                            {SORT_LABEL[item]}
                        </Link>
                    </Button>
                ))}
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </nav>
            <PublicTripGrid trips={trips.items} emptyLabel={EMPTY_TRIP_LABEL} />
            <PaginationCells
                page={trips.page}
                pageCount={trips.pageCount}
                buildHref={(nextPage) => `?${SORT_PARAM}=${sort}&${PAGE_PARAM}=${nextPage}`}
            />
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
