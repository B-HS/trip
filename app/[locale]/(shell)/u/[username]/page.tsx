import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageSchema } from '@/entities/community/community.validate'
import { getProfileByUsername } from '@/entities/profile/profile.cache'
import { resolveProfileTab } from '@/entities/profile/profile.validate'
import { PAGE_PARAM, PROFILE_TAB_PARAM } from '@/shared/constant/community'
import { getServerSession } from '@/shared/lib/session'
import { ProfilePage } from '@/widgets/profile/profile-page'

type UserProfilePageProps = {
    params: Promise<{ username: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const NOT_FOUND_TITLE = '프로필을 찾을 수 없습니다'

export const generateMetadata = async ({ params }: UserProfilePageProps): Promise<Metadata> => {
    const { username } = await params
    const profile = await getProfileByUsername(username)
    return { title: profile === null ? NOT_FOUND_TITLE : profile.name }
}

const UserProfilePage = async ({ params, searchParams }: UserProfilePageProps) => {
    const [{ username }, search] = await Promise.all([params, searchParams])
    const profile = await getProfileByUsername(username)
    if (profile === null) notFound()

    const session = await getServerSession()

    const viewerId = session?.user.id ?? null

    return (
        <ProfilePage
            profile={profile}
            username={profile.username ?? username}
            tab={resolveProfileTab(search[PROFILE_TAB_PARAM])}
            page={pageSchema.parse(search[PAGE_PARAM])}
            isOwner={viewerId === profile.id}
            viewerId={viewerId}
        />
    )
}

export default UserProfilePage
