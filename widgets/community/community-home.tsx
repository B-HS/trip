import dayjs from 'dayjs'
import { findLatestPosts } from '@/entities/community/community.repository'
import { findPublicTripsForHome } from '@/entities/trip/trip.repository.explore'
import { BoardCells } from '@/features/community/board-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { SectionHeading } from '@/features/community/section-heading'
import { EMPTY_POST_LABEL, EMPTY_TRIP_LABEL, HOME_POST_LIMIT, HOME_REVIEW_LIMIT, SORT_PARAM, type BoardKind } from '@/shared/constant/community'
import { BOARDS_PATH, EXPLORE_PATH } from '@/shared/constant/route'

const TODAY_FORMAT = 'YYYY-MM-DD'
const REVIEW_BOARD_KIND: BoardKind = 'review'
const REVIEW_BOARD_PATH = '/boards/review'

export const CommunityHome = async () => {
    const today = dayjs().format(TODAY_FORMAT)
    const [trips, posts, reviews] = await Promise.all([
        findPublicTripsForHome(today),
        findLatestPosts(HOME_POST_LIMIT),
        findLatestPosts(HOME_REVIEW_LIMIT, REVIEW_BOARD_KIND),
    ])

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>COMMUNITY</p>
                <h1 className='text-2xl font-semibold tracking-tight'>커뮤니티 홈</h1>
                <p className='text-xs text-muted-foreground'>다른 여행자가 공개한 일정과 게시판 글을 모아 봅니다.</p>
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='이번 주 여행 플랜' description='이번 주에 시작하는 공개 일정입니다.' />
                <PublicTripGrid trips={trips.thisWeek} emptyLabel={EMPTY_TRIP_LABEL} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='이번 달 여행 플랜' description='이번 달에 시작하는 공개 일정입니다.' />
                <PublicTripGrid trips={trips.thisMonth} emptyLabel={EMPTY_TRIP_LABEL} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='최근 공개 트립' description='가장 최근에 업데이트된 공개 일정입니다.' moreHref={EXPLORE_PATH} />
                <PublicTripGrid trips={trips.recent} emptyLabel={EMPTY_TRIP_LABEL} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='인기 트립' description='좋아요가 많은 공개 일정입니다.' moreHref={`${EXPLORE_PATH}?${SORT_PARAM}=popular`} />
                <PublicTripGrid trips={trips.popular} emptyLabel={EMPTY_TRIP_LABEL} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='최신 글' description='게시판에 올라온 새 글입니다.' moreHref={BOARDS_PATH} />
                <BoardCells />
                <PostList posts={posts} showBoard emptyLabel={EMPTY_POST_LABEL} />
            </section>
            <section className='flex flex-col gap-px'>
                <SectionHeading title='최신 후기' description='다녀온 여행의 후기입니다.' moreHref={REVIEW_BOARD_PATH} />
                <PostList posts={reviews} emptyLabel={EMPTY_POST_LABEL} />
            </section>
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
