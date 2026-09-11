import { getTranslations } from 'next-intl/server'
import { getBlockedIds } from '@/entities/community/community.cache'
import { findPostsByAuthor } from '@/entities/community/community.repository'
import { findLikedTrips, findPublicTripsByOwner } from '@/entities/profile/profile.repository'
import type { ProfileTab } from '@/entities/profile/profile.validate'
import type { PublicProfile } from '@/entities/profile/profile.type'
import { PaginationCells } from '@/features/community/pagination-cells'
import { PostList } from '@/features/community/post-list'
import { PublicTripGrid } from '@/features/community/public-trip-grid'
import { SectionHeading } from '@/features/community/section-heading'
import { ProfileHeader } from '@/features/profile/profile-header'
import { ProfileModerationWidget } from '@/widgets/profile/profile-moderation-widget'
import { ProfileTabs } from '@/features/profile/profile-tabs'
import { PAGE_PARAM, PROFILE_TAB_PARAM } from '@/shared/constant/community'

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
    const t = await getTranslations('profile')
    const tEmpty = await getTranslations('community.empty')
    const [posts, trips] = await Promise.all([
        tab === 'posts' ? findPostsByAuthor(profile.id, page, viewerId) : Promise.resolve(null),
        findTripPage(tab, profile.id, page),
    ])
    const pageInfo = posts ?? trips
    const canModerate = viewerId !== null && !isOwner
    const isBlocked = viewerId === null ? false : (await getBlockedIds(viewerId)).includes(profile.id)

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <ProfileHeader profile={profile} username={username} isOwner={isOwner} />
            {canModerate && <ProfileModerationWidget userId={profile.id} isBlocked={isBlocked} />}
            <ProfileTabs activeTab={tab} />
            <section className='flex flex-col gap-px'>
                <SectionHeading title={t(`sections.${tab}`)} />
                {posts !== null && <PostList posts={posts.items} showBoard emptyLabel={tEmpty('post')} />}
                {trips !== null && <PublicTripGrid trips={trips.items} emptyLabel={tab === 'likes' ? tEmpty('likedTrip') : tEmpty('trip')} />}
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
