import { findPostsByAuthor } from '@/entities/community/community.repository'
import { findLikedTrips, findPublicTripsByOwner } from '@/entities/profile/profile.repository'
import type { ProfileTab } from '@/entities/profile/profile.validate'
import type { PublicProfile } from '@/entities/profile/profile.type'
import { PaginationCells } from '@/features/community/pagination-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { SectionHeading } from '@/features/community/section-heading'
import { ProfileHeader } from '@/features/profile/profile-header'
import { ProfileTabs } from '@/features/profile/profile-tabs'
import { EMPTY_LIKED_TRIP_LABEL, EMPTY_POST_LABEL, EMPTY_TRIP_LABEL, PAGE_PARAM, PROFILE_TAB_PARAM } from '@/shared/constant/community'

const TAB_SECTION_TITLE = { posts: '작성한 글', trips: '공개 트립', likes: '좋아요한 트립' } as const satisfies Record<ProfileTab, string>

const findTripPage = async (tab: ProfileTab, userId: string, page: number) => {
    if (tab === 'trips') return findPublicTripsByOwner(userId, page)
    if (tab === 'likes') return findLikedTrips(userId, page)
    return null
}

export type ProfilePageProps = {
    profile: PublicProfile
    username: string
    tab: ProfileTab
    page: number
    isOwner: boolean
    viewerId?: string | null
}

export const ProfilePage = async ({ profile, username, tab, page, isOwner, viewerId = null }: ProfilePageProps) => {
    const posts = tab === 'posts' ? await findPostsByAuthor(profile.id, page, viewerId) : null
    const trips = await findTripPage(tab, profile.id, page)
    const pageInfo = posts ?? trips

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <ProfileHeader profile={profile} username={username} isOwner={isOwner} />
            <ProfileTabs activeTab={tab} />
            <section className='flex flex-col gap-px'>
                <SectionHeading title={TAB_SECTION_TITLE[tab]} />
                {posts !== null && <PostList posts={posts.items} showBoard emptyLabel={EMPTY_POST_LABEL} />}
                {trips !== null && <PublicTripGrid trips={trips.items} emptyLabel={tab === 'likes' ? EMPTY_LIKED_TRIP_LABEL : EMPTY_TRIP_LABEL} />}
            </section>
            {pageInfo !== null && (
                <PaginationCells
                    page={pageInfo.page}
                    pageCount={pageInfo.pageCount}
                    buildHref={(nextPage) => `?${PROFILE_TAB_PARAM}=${tab}&${PAGE_PARAM}=${nextPage}`}
                />
            )}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
