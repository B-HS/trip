import { findLatestPosts } from '@/entities/community/community.repository'
import { getTranslations } from 'next-intl/server'
import { findRecentPublicTrips } from '@/entities/trip/trip.repository.explore'
import { BoardCells } from '@/features/community/board-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { IntroSectionHeading } from '@/features/intro/intro-section-heading'
import { INTRO_POST_LIMIT, INTRO_TRIP_LIMIT } from '@/shared/constant/community'

const PUBLIC_SEAM_CLASS = 'bg-border'
const PUBLIC_PANEL_CLASS = 'flex flex-col gap-px bg-border'
const PUBLIC_STRIP_CLASS = 'bg-muted p-6'

export const IntroCommunitySections = async () => {
    const t = await getTranslations('intro.community')
    const [trips, posts] = await Promise.all([findRecentPublicTrips(INTRO_TRIP_LIMIT), findLatestPosts(INTRO_POST_LIMIT)])
    if (trips.length === 0 && posts.length === 0) return null

    return (
        <div className='flex w-full flex-col'>
            <section className='mx-auto w-full max-w-7xl px-6 py-16'>
                <div className={PUBLIC_PANEL_CLASS}>
                    <IntroSectionHeading
                        eyebrow={t('tripsEyebrow')}
                        title={t('tripsTitle')}
                        description={t('tripsDescription')}
                        className={PUBLIC_STRIP_CLASS}
                    />
                    <PublicTripGrid trips={trips} emptyLabel={t('tripsEmpty')} className={PUBLIC_SEAM_CLASS} />
                </div>
            </section>
            <section className='mx-auto w-full max-w-7xl px-6 pb-20'>
                <div className={PUBLIC_PANEL_CLASS}>
                    <IntroSectionHeading
                        eyebrow={t('postsEyebrow')}
                        title={t('postsTitle')}
                        description={t('postsDescription')}
                        className={PUBLIC_STRIP_CLASS}
                    />
                    <BoardCells className={PUBLIC_SEAM_CLASS} />
                    <PostList posts={posts} showBoard emptyLabel={t('postsEmpty')} className={PUBLIC_SEAM_CLASS} />
                </div>
            </section>
        </div>
    )
}
