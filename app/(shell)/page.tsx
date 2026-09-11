import type { Metadata } from 'next'
import { INTRO_METADATA } from '@/shared/constant/marketing'
import { getServerSession } from '@/shared/lib/session'
import { CommunityHome } from '@/widgets/community/community-home'
import { IntroCommunitySections } from '@/widgets/intro/intro-community-sections'
import { IntroWidget } from '@/widgets/intro/intro-widget'

export const metadata: Metadata = {
    title: INTRO_METADATA.title,
    description: INTRO_METADATA.description,
}

const HomePage = async () => {
    const session = await getServerSession()
    if (session) return <CommunityHome viewerId={session.user.id} />

    return (
        <>
            <IntroWidget />
            <IntroCommunitySections />
        </>
    )
}

export default HomePage
