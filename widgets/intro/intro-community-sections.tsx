import { findLatestPosts } from '@/entities/community/community.repository'
import { findRecentPublicTrips } from '@/entities/trip/trip.repository.explore'
import { BoardCells } from '@/features/community/board-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { IntroSectionHeading } from '@/features/intro/intro-section-heading'
import { EMPTY_POST_LABEL, EMPTY_TRIP_LABEL, INTRO_POST_LIMIT, INTRO_TRIP_LIMIT } from '@/shared/constant/community'

const PUBLIC_SEAM_CLASS = 'bg-border'
const PUBLIC_PANEL_CLASS = 'flex flex-col gap-px bg-border'
const PUBLIC_STRIP_CLASS = 'bg-muted p-6'

const TRIP_SECTION = {
    eyebrow: '공개 일정',
    title: '공개된 여행 일정',
    description: '다른 여행자가 공개한 일정을 그대로 열어 볼 수 있습니다.',
}

const POST_SECTION = {
    eyebrow: '커뮤니티',
    title: '커뮤니티 최신 글',
    description: '자유·질문·후기 게시판에 올라온 새 글입니다.',
}

export const IntroCommunitySections = async () => {
    const [trips, posts] = await Promise.all([findRecentPublicTrips(INTRO_TRIP_LIMIT), findLatestPosts(INTRO_POST_LIMIT)])
    if (trips.length === 0 && posts.length === 0) return null

    return (
        <div className='flex w-full flex-col'>
            <section className='mx-auto w-full max-w-7xl px-6 py-16'>
                <div className={PUBLIC_PANEL_CLASS}>
                    <IntroSectionHeading {...TRIP_SECTION} className={PUBLIC_STRIP_CLASS} />
                    <PublicTripGrid trips={trips} emptyLabel={EMPTY_TRIP_LABEL} className={PUBLIC_SEAM_CLASS} />
                </div>
            </section>
            <section className='mx-auto w-full max-w-7xl px-6 pb-20'>
                <div className={PUBLIC_PANEL_CLASS}>
                    <IntroSectionHeading {...POST_SECTION} className={PUBLIC_STRIP_CLASS} />
                    <BoardCells className={PUBLIC_SEAM_CLASS} />
                    <PostList posts={posts} showBoard emptyLabel={EMPTY_POST_LABEL} className={PUBLIC_SEAM_CLASS} />
                </div>
            </section>
        </div>
    )
}
