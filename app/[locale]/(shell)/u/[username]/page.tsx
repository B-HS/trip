import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { pageSchema } from '@/entities/community/community.validate'
import { getProfileByUsername } from '@/entities/profile/profile.cache'
import { resolveProfileTab } from '@/entities/profile/profile.validate'
import { PAGE_PARAM, PROFILE_TAB_PARAM } from '@/shared/constant/community'
import { getServerSession } from '@/shared/lib/session'
import { ProfilePage } from '@/widgets/profile/profile-page'
import { createPageMetadata } from '@/shared/lib/metadata'
import { buildProfilePageJsonLd } from '@/shared/lib/json-ld'
import { localizedUrl } from '@/shared/lib/seo'
import { JsonLdScript } from '@/features/seo/json-ld-script'

type UserProfilePageProps = {
    params: Promise<{ locale: string; username: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async ({ params }: UserProfilePageProps): Promise<Metadata> => {
    const { locale, username } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.profileNotFound' })
    const profile = await getProfileByUsername(username)
    return createPageMetadata({
        locale,
        path: `/u/${encodeURIComponent(username)}`,
        title: profile === null ? t('title') : profile.name,
        description: profile?.bio ?? undefined,
        indexable: profile !== null,
    })
}

const UserProfilePage = async ({ params, searchParams }: UserProfilePageProps) => {
    const [{ locale, username }, search] = await Promise.all([params, searchParams])
    const profile = await getProfileByUsername(username)
    if (profile === null) notFound()

    const session = await getServerSession()

    const viewerId = session?.user.id ?? null

    const profileUrl = localizedUrl(`/u/${encodeURIComponent(profile.username ?? username)}`, locale)
    return (
        <>
            <JsonLdScript data={buildProfilePageJsonLd(profile, profileUrl)} />
            <ProfilePage
                profile={profile}
                username={profile.username ?? username}
                tab={resolveProfileTab(search[PROFILE_TAB_PARAM])}
                page={pageSchema.parse(search[PAGE_PARAM])}
                isOwner={viewerId === profile.id}
                viewerId={viewerId}
            />
        </>
    )
}

export default UserProfilePage
