import { getTranslations } from 'next-intl/server'
import { findBoards, findLatestPostsByBoard } from '@/entities/community/community.repository'
import { PostList } from '@/features/community/post-list'
import { SectionHeading } from '@/features/community/section-heading'

const BOARD_PREVIEW_LIMIT = 5

export type BoardsIndexProps = {
    viewerId?: string | null
}

export const BoardsIndex = async ({ viewerId = null }: BoardsIndexProps) => {
    const t = await getTranslations('community.boards')
    const tEmpty = await getTranslations('community.empty')
    const boards = await findBoards()
    const previews = await Promise.all(
        boards.map(async (board) => ({ board, posts: await findLatestPostsByBoard(board.key, BOARD_PREVIEW_LIMIT, viewerId) })),
    )

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>BOARDS</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </section>
            {previews.map(({ board, posts }) => (
                <section key={board.id} className='flex flex-col gap-px'>
                    <SectionHeading
                        title={board.name}
                        description={board.description ?? undefined}
                        moreHref={`/boards/${board.key}`}
                        moreLabel={t('more')}
                    />
                    <PostList posts={posts} emptyLabel={tEmpty('post')} />
                </section>
            ))}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
