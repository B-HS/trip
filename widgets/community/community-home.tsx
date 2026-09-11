import dayjs from 'dayjs'
import { getTranslations } from 'next-intl/server'
import { findLatestPosts } from '@/entities/community/community.repository'
import { findPublicTripsForHome } from '@/entities/trip/trip.repository.explore'
import { BoardCells } from '@/features/community/board-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { SectionHeading } from '@/features/community/section-heading'
import { HOME_POST_LIMIT, HOME_REVIEW_LIMIT, SORT_PARAM, type BoardKind } from '@/shared/constant/community'
import { BOARDS_PATH, EXPLORE_PATH } from '@/shared/constant/route'

const TODAY_FORMAT = 'YYYY-MM-DD'
const REVIEW_BOARD_KIND: BoardKind = 'review'
const REVIEW_BOARD_PATH = '/boards/review'

export type CommunityHomeProps = {
    viewerId?: string | null
}

export const CommunityHome = async ({ viewerId = null }: CommunityHomeProps) => {
    const t = await getTranslations('community.home')
    const tEmpty = await getTranslations('community.empty')
    const today = dayjs().format(TODAY_FORMAT)
    const [trips, posts, reviews] = await Promise.all([
        findPublicTripsForHome(today),
        findLatestPosts(HOME_POST_LIMIT, undefined, viewerId),
        findLatestPosts(HOME_REVIEW_LIMIT, REVIEW_BOARD_KIND, viewerId),
    ])

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>COMMUNITY</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('weekTitle')} description={t('weekDesc')} />
                <PublicTripGrid trips={trips.thisWeek} emptyLabel={tEmpty('trip')} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('monthTitle')} description={t('monthDesc')} />
                <PublicTripGrid trips={trips.thisMonth} emptyLabel={tEmpty('trip')} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('recentTitle')} description={t('recentDesc')} moreHref={EXPLORE_PATH} />
                <PublicTripGrid trips={trips.recent} emptyLabel={tEmpty('trip')} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('popularTitle')} description={t('popularDesc')} moreHref={`${EXPLORE_PATH}?${SORT_PARAM}=popular`} />
                <PublicTripGrid trips={trips.popular} emptyLabel={tEmpty('trip')} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('latestTitle')} description={t('latestDesc')} moreHref={BOARDS_PATH} />
                <BoardCells />
                <PostList posts={posts} showBoard emptyLabel={tEmpty('post')} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t('reviewTitle')} description={t('reviewDesc')} moreHref={REVIEW_BOARD_PATH} />
                <PostList posts={reviews} emptyLabel={tEmpty('post')} />
            </section>
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
