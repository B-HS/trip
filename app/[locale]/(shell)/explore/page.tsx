import type { Metadata } from 'next'
import { exploreSearchSchema } from '@/entities/community/community.validate'
import { ExploreList } from '@/widgets/community/explore-list'

type ExplorePageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
    title: '탐색',
}

const ExplorePage = async ({ searchParams }: ExplorePageProps) => {
    const { sort, page } = exploreSearchSchema.parse(await searchParams)

    return <ExploreList sort={sort} page={page} />
}

export default ExplorePage
