import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBoardByKey } from '@/entities/community/community.cache'
import { findPostPage } from '@/entities/community/community.repository'
import { postSearchSchema } from '@/entities/community/community.validate'
import { getServerSession } from '@/shared/lib/session'
import { BoardList } from '@/widgets/community/board-list'

type BoardPageProps = {
    params: Promise<{ key: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const NOT_FOUND_TITLE = '게시판을 찾을 수 없습니다'

export const generateMetadata = async ({ params }: BoardPageProps): Promise<Metadata> => {
    const { key } = await params
    const board = await getBoardByKey(key)
    return { title: board === null ? NOT_FOUND_TITLE : board.name }
}

const BoardPage = async ({ params, searchParams }: BoardPageProps) => {
    const [{ key }, search] = await Promise.all([params, searchParams])
    const { page, q } = postSearchSchema.parse(search)
    const board = await getBoardByKey(key)
    if (board === null) notFound()

    const session = await getServerSession()
    const posts = await findPostPage({ boardKey: board.key, page, q, viewerId: session?.user.id ?? null })

    return <BoardList board={board} posts={posts} query={q} isSignedIn={session !== null} />
}

export default BoardPage
