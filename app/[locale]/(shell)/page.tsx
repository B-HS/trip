import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getServerSession } from '@/shared/lib/session'
import { CommunityHome } from '@/widgets/community/community-home'
import { IntroCommunitySections } from '@/widgets/intro/intro-community-sections'
import { IntroWidget } from '@/widgets/intro/intro-widget'
import { createPageMetadata } from '@/shared/lib/metadata'

type HomePageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: HomePageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.home' })
    return createPageMetadata({ locale, path: '/', title: t('title'), description: t('description') })
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
