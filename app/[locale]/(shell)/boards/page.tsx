import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getServerSession } from '@/shared/lib/session'
import { BoardsIndex } from '@/widgets/community/boards-index'
import { createPageMetadata } from '@/shared/lib/metadata'

type BoardsPageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: BoardsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.boards' })
    return createPageMetadata({ locale, path: '/boards', title: t('title'), description: t('description') })
}

const BoardsPage = async () => {
    const session = await getServerSession()

    return (
        <div className='mx-auto max-w-7xl'>
            <BoardsIndex viewerId={session?.user.id ?? null} />
        </div>
    )
}

export default BoardsPage
