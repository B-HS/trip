import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { exploreSearchSchema } from '@/entities/community/community.validate'
import { ExploreList } from '@/widgets/community/explore-list'

type ExplorePageProps = {
    params: Promise<{ locale: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async ({ params }: ExplorePageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.explore' })
    return { title: t('title'), description: t('description') }
}

const ExplorePage = async ({ searchParams }: ExplorePageProps) => {
    const { sort, page } = exploreSearchSchema.parse(await searchParams)

    return <ExploreList sort={sort} page={page} />
}

export default ExplorePage
